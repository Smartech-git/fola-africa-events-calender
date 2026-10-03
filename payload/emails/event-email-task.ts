import type { CollectionAfterChangeHook, TaskConfig } from "payload";

import { eventPath } from "@/lib/events/event-list";
import { emailAfterChange } from "@/payload/emails/after-change";
import {
  EMAIL_QUEUE,
  EMAIL_RETRIES,
  emailMessageSchema,
  emailSettings,
  emailSiteUrl,
} from "@/payload/emails/email-settings";
import { eventEmailTemplate } from "@/payload/emails/event-email-template";
import {
  EmailDeliveryError,
  sendEventEmail,
} from "@/payload/emails/send-event-email";
import { toPublicEvent } from "@/payload/public-event";

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
  const key = `event-${doc.id}-published`;
  const existing = await req.payload.count({
    collection: "email-notifications",
    where: { key: { equals: key } },
    req,
    overrideAccess: true,
  });
  if (existing.totalDocs) return doc;
  const notification = await req.payload.create({
    collection: "email-notifications",
    req,
    overrideAccess: true,
    depth: 0,
    data: { key, eventId: doc.id, kind: "published", status: "queued" },
  });
  // The outbox and its job commit/roll back with the event; no email is sent here.
  const job = await req.payload.jobs.queue({
    task: "send-event-email",
    queue: EMAIL_QUEUE,
    input: { notificationId: notification.id },
    req,
  });
  emailAfterChange(job.id);
  return doc;
};

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
    try {
      // Old queued receipts must not send after switching to publication-only mail.
      if (notification.kind !== "published") {
        await update({
          status: "skipped",
          failureReason: "Submission confirmation emails are disabled.",
        });
        return { output: {} };
      }
      const settings = emailSettings();
      if (!settings)
        throw new Error("Resend email settings are not configured.");
      const events = await payload.find({
        collection: "events",
        where: { id: { equals: notification.eventId } },
        limit: 1,
        depth: 1,
        req,
        overrideAccess: true,
      });
      const event = events.docs[0];
      const published = event ? toPublicEvent(event) : null;
      if (
        !event ||
        event.isDemo ||
        event.source !== "submission" ||
        !event.submittedBy?.email ||
        !published?.city
      ) {
        await update({
          status: "skipped",
          failureReason:
            "Event removed, no longer eligible, or not publicly available.",
        });
        return { output: {} };
      }
      // After Resend's 24-hour deduplication window, an interrupted send requires
      // manual investigation rather than risking another email to the submitter.
      if (
        notification.firstAttemptAt &&
        Date.now() - Date.parse(notification.firstAttemptAt) >=
          23 * 60 * 60 * 1000
      )
        throw new Error(
          "Delivery is uncertain and its retry window expired. Check Resend before retrying.",
        );
      let message = emailMessageSchema.safeParse(notification.message);
      if (!message.success) {
        if (notification.firstAttemptAt)
          throw new Error("The saved email message is invalid.");
        const url = new URL(
          eventPath(published, published.city.slug),
          emailSiteUrl(),
        ).href;
        const snapshot = eventEmailTemplate({
          kind: notification.kind,
          title: published.title,
          name: event.submittedBy.name || "",
          recipient: event.submittedBy.email,
          sender: settings.sender,
          url,
        });
        await update({
          message: snapshot,
          firstAttemptAt: new Date().toISOString(),
          status: "queued",
          failureReason: null,
        });
        message = emailMessageSchema.safeParse(snapshot);
      }
      if (!message.success)
        throw new Error("Unable to prepare the notification email.");
      if (notification.message && !notification.firstAttemptAt)
        await update({ firstAttemptAt: new Date().toISOString() });
      const providerId = await sendEventEmail(
        message.data,
        `fola/${notification.key}/${Date.parse(notification.createdAt)}`,
      );
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
        ...(error instanceof EmailDeliveryError && error.definitelyRejected
          ? { firstAttemptAt: null }
          : {}),
      });
      throw new Error(reason);
    }
  },
};
