import type {
  CollectionAfterChangeHook,
  PayloadRequest,
  TaskConfig,
} from "payload";
import { z } from "zod";

import { eventPath } from "@/lib/events/event-list";
import { emailAfterChange } from "@/payload/emails/after-change";
import {
  EMAIL_QUEUE,
  EMAIL_RETRIES,
  emailMessageSchema,
  emailSettings,
  emailSiteUrl,
  type EmailMessage,
  type EventEmailKind,
} from "@/payload/emails/email-settings";
import { eventEmailTemplate } from "@/payload/emails/event-email-template";
import {
  EmailDeliveryError,
  sendEventEmail,
} from "@/payload/emails/send-event-email";
import { teamAlertTemplate } from "@/payload/emails/team-alert-template";
import { DEFAULT_SUBMISSION_RECIPIENT } from "@/payload/globals/notification-settings";
import { toPublicEvent } from "@/payload/public-event";
import type { Event } from "@/payload-types";

/** Creates the outbox record and its job; both commit or roll back with the event. */
async function queueNotification(
  req: PayloadRequest,
  data: {
    key: string;
    eventId: number;
    kind: EventEmailKind;
    recipient?: string;
  },
) {
  const existing = await req.payload.count({
    collection: "email-notifications",
    where: { key: { equals: data.key } },
    req,
    overrideAccess: true,
  });
  if (existing.totalDocs) return;
  const notification = await req.payload.create({
    collection: "email-notifications",
    req,
    overrideAccess: true,
    depth: 0,
    data: { ...data, status: "queued" },
  });
  const job = await req.payload.jobs.queue({
    task: "send-event-email",
    queue: EMAIL_QUEUE,
    input: { notificationId: notification.id },
    req,
  });
  emailAfterChange(job.id);
}

export const queueEventEmail: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  if (
    doc.isDemo ||
    doc.source !== "submission" ||
    !doc.submittedBy?.email ||
    doc.status !== "published" ||
    !doc.publishedAt ||
    previousDoc?.publishedAt
  )
    return doc;
  await queueNotification(req, {
    key: `event-${doc.id}-published`,
    eventId: doc.id,
    kind: "published",
  });
  return doc;
};

/** Emails each address in Notification settings when an event is submitted. */
export const queueTeamAlert: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== "create" || doc.isDemo || doc.source !== "submission")
    return doc;
  const settings = await req.payload.findGlobal({
    slug: "notification-settings",
    req,
    overrideAccess: true,
    depth: 0,
  });
  // Until an admin saves the settings, alerts go to the default inbox.
  const listed = settings.updatedAt
    ? (settings.submissionRecipients ?? []).map((row) => row.email)
    : [DEFAULT_SUBMISSION_RECIPIENT];
  const recipients = [
    ...new Set(
      listed
        .map((email) => email?.trim().toLowerCase())
        .filter((email): email is string => z.email().safeParse(email).success),
    ),
  ];
  for (const recipient of recipients)
    await queueNotification(req, {
      key: `event-${doc.id}-team-${recipient}`,
      eventId: doc.id,
      kind: "team",
      recipient,
    });
  return doc;
};

type Prepared = { message: EmailMessage } | { skip: string };

async function prepareMessage(
  kind: EventEmailKind,
  event: Event,
  recipient: string | null | undefined,
  sender: string,
): Promise<Prepared> {
  if (kind === "team") {
    if (!recipient || !z.email().safeParse(recipient).success)
      return { skip: "The alert has no valid recipient." };
    const adminUrl = new URL(
      `/admin/collections/events/${event.id}`,
      emailSiteUrl(),
    ).href;
    return {
      message: teamAlertTemplate({ event, recipient, sender, adminUrl }),
    };
  }
  const published = toPublicEvent(event);
  if (
    event.source !== "submission" ||
    !event.submittedBy?.email ||
    !published?.city
  )
    return {
      skip: "Event removed, no longer eligible, or not publicly available.",
    };
  const url = new URL(eventPath(published, published.city.slug), emailSiteUrl())
    .href;
  return {
    message: eventEmailTemplate({
      kind,
      title: published.title,
      name: event.submittedBy.name || "",
      recipient: event.submittedBy.email,
      sender,
      url,
    }),
  };
}

export const sendEventEmailTask: TaskConfig<{
  input: { notificationId: number };
  output: Record<string, never>;
}> = {
  slug: "send-event-email",
  label: "Send event notification email",
  inputSchema: [{ name: "notificationId", type: "number", required: true }],
  concurrency: ({ input }) => `email-${input.notificationId}`,
  retries: {
    attempts: EMAIL_RETRIES,
    backoff: { type: "exponential", delay: 60_000 },
  },
  handler: async ({ input, req, job }) => {
    const { payload } = req;
    const notifications = await payload.find({
      collection: "email-notifications",
      where: { id: { equals: input.notificationId } },
      limit: 1,
      depth: 0,
      req,
      overrideAccess: true,
    });
    const notification = notifications.docs[0];
    if (!notification || ["sent", "skipped"].includes(notification.status))
      return { output: {} };
    const update = (data: Partial<typeof notification>) =>
      payload.update({
        collection: "email-notifications",
        id: notification.id,
        data,
        req,
        depth: 0,
        overrideAccess: true,
      });
    const reference = `fola/${notification.key}/${Date.parse(notification.createdAt)}`;
    try {
      // Old queued receipts must not send after switching to publication-only mail.
      if (notification.kind === "submitted") {
        await update({
          status: "skipped",
          failureReason: "Submission confirmation emails are disabled.",
        });
        return { output: {} };
      }
      const settings = emailSettings();
      if (!settings)
        throw new Error("ZeptoMail email settings are not configured.");
      // ZeptoMail has no idempotency key. An attempt that may have reached it is
      // never repeated automatically; staff check the logs and resend by hand.
      if (notification.firstAttemptAt) {
        await update({
          status: "failed",
          failureReason: `Delivery is uncertain. Check the ZeptoMail email logs for reference "${reference}" before sending again.`,
        });
        return { output: {} };
      }
      const events = await payload.find({
        collection: "events",
        where: { id: { equals: notification.eventId } },
        limit: 1,
        depth: 1,
        req,
        overrideAccess: true,
      });
      const event = events.docs[0];
      if (!event || event.isDemo) {
        await update({
          status: "skipped",
          failureReason: "Event removed or marked as demo.",
        });
        return { output: {} };
      }
      let message = emailMessageSchema.safeParse(notification.message);
      if (!message.success) {
        const prepared = await prepareMessage(
          notification.kind,
          event,
          notification.recipient,
          settings.sender,
        );
        if ("skip" in prepared) {
          await update({ status: "skipped", failureReason: prepared.skip });
          return { output: {} };
        }
        await update({ message: prepared.message, failureReason: null });
        message = emailMessageSchema.safeParse(prepared.message);
      }
      if (!message.success)
        throw new Error("Unable to prepare the notification email.");
      await update({ firstAttemptAt: new Date().toISOString() });
      const providerId = await sendEventEmail(message.data, reference);
      await update({
        status: "sent",
        sentAt: new Date().toISOString(),
        providerId,
        failureReason: null,
      });
      return { output: {} };
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Email delivery failed.";
      await update({
        status: (job.totalTried ?? 0) >= EMAIL_RETRIES ? "failed" : "queued",
        failureReason: reason,
        // A definite refusal sent nothing, so the next retry may send again.
        ...(error instanceof EmailDeliveryError && error.definitelyRejected
          ? { firstAttemptAt: null }
          : {}),
      });
      throw new Error(reason);
    }
  },
};
