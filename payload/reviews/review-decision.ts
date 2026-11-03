import {
  APIError,
  commitTransaction,
  initTransaction,
  killTransaction,
  type PayloadHandler,
} from "payload";
import { z } from "zod";

import { SITE_NAME } from "@/constants/brand";
import { CONTACT_EMAIL } from "@/constants/socials";
import { roleOf } from "@/payload/access";
import { emailSettings, emailSiteUrl } from "@/payload/emails/email-settings";
import { queueNotification } from "@/payload/emails/event-email-task";
import { happeningUpdateTemplate } from "@/payload/emails/happening-update-template";
import { relationID } from "@/payload/validation";
import type { Event } from "@/payload-types";

/** Request context: a review decision saved together with its email. */
export const SENDING_REVIEW_DECISION = "sendingReviewDecision";

/** Decisions that must reach the submitter, so they are only saved by sending. */
export const EMAILED_DECISIONS = ["rejected", "request-information"];

export const SEND_DECISION_PATH = "/:id/send-decision";

const bodySchema = z.object({
  decision: z.enum(["rejected", "request-information"]),
  message: z
    .string()
    .trim()
    .min(1, "Write the message to the submitter first.")
    .max(5000),
});

/** To the submitter: their happening was not approved, or needs more detail. */
export function reviewDecisionMessage(args: {
  decision: "rejected" | "request-information";
  to: string;
  sender: string;
  name: string;
  title: string;
  message: string;
  accountUrl?: string;
}) {
  const rejected = args.decision === "rejected";
  const message = args.message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    ...happeningUpdateTemplate({
      to: args.to,
      sender: args.sender,
      subject: `${rejected ? "Your Happening wasn’t approved" : "More information needed"}: ${args.title}`,
      kicker: rejected ? "Not approved" : "Information requested",
      heading: rejected ? "Not approved" : "A few details",
      greeting: args.name ? `Hello ${args.name},` : undefined,
      paragraphs: rejected
        ? [
            `Thank you for submitting ${args.title} to ${SITE_NAME}. The Happenings team has reviewed it and won’t be listing it.`,
            ...message,
          ]
        : [
            `Thank you for submitting ${args.title} to ${SITE_NAME}. Before it can go on the calendar, the Happenings team needs a little more information.`,
            ...message,
            "Reply to this email with the details and we’ll pick up the review.",
          ],
      title: args.title,
      status: rejected ? "Not approved" : "In review · information requested",
      button: args.accountUrl
        ? { label: "View my happenings", url: args.accountUrl }
        : undefined,
      footnote: rejected
        ? `Questions? Reply to this email or reach us at ${CONTACT_EMAIL}.`
        : undefined,
    }),
    // Replies reach the team, not the sending address.
    replyTo: CONTACT_EMAIL,
  };
}

/**
 * POST /api/event-reviews/:id/send-decision: records a rejection or an
 * information request and emails the submitter, together or not at all.
 * A rejection also marks the event Rejected, so it leaves the review queue.
 */
export const sendDecisionHandler: PayloadHandler = async (req) => {
  if (!["admin", "approver"].includes(roleOf(req.user) || ""))
    return Response.json(
      { errors: [{ message: "Only a FOLA approver can send decisions." }] },
      { status: 403 },
    );
  const parsed = bodySchema.safeParse(await req.json?.().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { errors: [{ message: parsed.error.issues[0]?.message }] },
      { status: 400 },
    );
  const { decision, message } = parsed.data;
  const sender = emailSettings()?.sender;
  if (!sender)
    return Response.json(
      { errors: [{ message: "Email sending is not configured." }] },
      { status: 503 },
    );

  const shouldCommit = await initTransaction(req);
  try {
    const review = await req.payload.findByID({
      collection: "event-reviews",
      id: String(req.routeParams?.id),
      depth: 0,
      req,
    });
    const event: Event = await req.payload.findByID({
      collection: "events",
      id: relationID(review.event)!,
      depth: 0,
      req,
      overrideAccess: true,
    });
    if (event.source !== "submission" || event.status !== "submitted")
      throw new APIError(
        "Only a submission still waiting for review can be rejected or asked for more information.",
        400,
      );
    const memberId = relationID(event.member);
    const member = memberId
      ? await req.payload.findByID({
          collection: "members",
          id: memberId,
          depth: 0,
          req,
          overrideAccess: true,
          disableErrors: true,
          joins: false,
        })
      : null;
    const to = event.submittedBy?.email || member?.email;
    if (!to)
      throw new APIError(
        "This submission has no email address to reply to.",
        400,
      );

    const now = new Date().toISOString();
    await req.payload.update({
      collection: "event-reviews",
      id: review.id,
      req,
      depth: 0,
      overrideAccess: true,
      context: { [SENDING_REVIEW_DECISION]: true },
      data: {
        humanDecision: decision,
        draftMessage: message,
        decisionEmailSentAt: now,
        decisionEmailSentBy: req.user!.id,
      },
    });
    if (decision === "rejected")
      await req.payload.update({
        collection: "events",
        id: event.id,
        req,
        depth: 0,
        overrideAccess: true,
        context: { [SENDING_REVIEW_DECISION]: true },
        data: { status: "rejected" },
      });
    await queueNotification(req, {
      key: `review-${review.id}-${decision}-${Date.parse(now)}`,
      eventId: event.id,
      kind: decision === "rejected" ? "rejected" : "information-request",
      recipient: to,
      message: reviewDecisionMessage({
        decision,
        to,
        sender,
        name: event.submittedBy?.name || member?.fullName || "",
        title: event.title,
        message,
        accountUrl: member
          ? new URL("/account/happenings", emailSiteUrl()).href
          : undefined,
      }),
    });
    if (shouldCommit) await commitTransaction(req);
    return Response.json({ recipient: to });
  } catch (error) {
    if (shouldCommit) await killTransaction(req);
    const status = error instanceof APIError ? error.status : 500;
    return Response.json(
      {
        errors: [
          {
            message:
              error instanceof Error
                ? error.message
                : "Unable to send the decision.",
          },
        ],
      },
      { status },
    );
  }
};
