import { APIError, type CollectionConfig } from "payload";

import {
  adminField,
  isAdmin,
  isStaff,
  noAccess,
  roleOf,
} from "@/payload/access";
import {
  EMAILED_DECISIONS,
  SEND_DECISION_PATH,
  SENDING_REVIEW_DECISION,
  sendDecisionHandler,
} from "@/payload/reviews/review-decision";
import { enqueueReview } from "@/payload/reviews/review-task";
import { relationID } from "@/payload/validation";

export const eventReviews: CollectionConfig = {
  slug: "event-reviews",
  admin: {
    group: "Review",
    useAsTitle: "id",
    defaultColumns: [
      "event",
      "aiStatus",
      "recommendation",
      "humanDecision",
      "createdAt",
    ],
    description:
      "AI findings and submitted details are retained alongside the human decision. Public submissions require completed AI review; administrator approval or publication records the final decision.",
  },
  access: {
    create: noAccess,
    read: isStaff,
    update: isStaff,
    delete: isAdmin,
    readVersions: isStaff,
  },
  versions: { maxPerDoc: 3 },
  endpoints: [
    { path: SEND_DECISION_PATH, method: "post", handler: sendDecisionHandler },
  ],
  hooks: {
    afterChange: [enqueueReview],
    beforeChange: [
      async ({ data, originalDoc, req, operation, context }) => {
        // A rejection or information request must reach the submitter, so it
        // is saved only by the send button, together with its email.
        if (
          operation === "update" &&
          EMAILED_DECISIONS.includes(data.humanDecision) &&
          data.humanDecision !== originalDoc?.humanDecision &&
          !context[SENDING_REVIEW_DECISION]
        )
          throw new APIError(
            "Use “Send email” under the decision to email the submitter. The decision is saved when the email is sent.",
            400,
          );
        let publicSubmission = false;
        if (
          !req.context.aiReviewWorker &&
          operation === "update" &&
          (data.aiStatus === "completed" ||
            (data.humanDecision && data.humanDecision !== "pending"))
        ) {
          const event = await req.payload.findByID({
            collection: "events",
            id: relationID(originalDoc?.event)!,
            depth: 0,
            req,
          });
          publicSubmission = event.source === "submission";
          // An administrator may complete the review by hand when the AI is unavailable.
          if (
            publicSubmission &&
            data.aiStatus === "completed" &&
            originalDoc?.aiStatus !== "completed" &&
            roleOf(req.user) !== "admin"
          )
            throw new APIError(
              "Only the AI worker or an administrator can complete a public submission's review.",
              400,
            );
        }
        if (
          operation === "update" &&
          data.humanDecision &&
          data.humanDecision !== originalDoc?.humanDecision &&
          data.humanDecision !== "pending"
        ) {
          if (!req.user)
            throw new APIError(
              "A staff member must record the recommendation decision.",
              403,
            );
          if (
            (roleOf(req.user) !== "admin" ||
              (publicSubmission &&
                ["accepted", "amended"].includes(data.humanDecision))) &&
            (data.aiStatus || originalDoc?.aiStatus) !== "completed"
          )
            throw new APIError(
              "Complete the AI review before recording a human decision.",
              400,
            );
          data.decidedBy = req.user.id;
          data.decidedAt = new Date().toISOString();
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "event",
      type: "relationship",
      relationTo: "events",
      required: true,
      index: true,
      access: { update: () => false },
    },
    {
      name: "originalListing",
      type: "json",
      required: true,
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "aiStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: ["pending", "processing", "completed", "failed"],
      access: { update: adminField },
      admin: {
        description:
          "Anthropic processes queued reviews. To retry a failed review, set this to Pending. If the AI is unavailable, an administrator can set this to Completed after checking the submission. Public submissions cannot be approved until the review is completed.",
      },
    },
    {
      name: "promptVersion",
      type: "text",
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "promptSnapshot",
      type: "textarea",
      access: { update: () => false },
      admin: {
        readOnly: true,
        components: {
          Field: "@/payload/components/review-fields#ReviewPrompt",
        },
      },
    },
    {
      name: "model",
      type: "text",
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "findings",
      type: "json",
      access: { update: () => false },
      admin: {
        readOnly: true,
        components: {
          Field: "@/payload/components/review-fields#ReviewFindings",
        },
      },
    },
    {
      name: "summary",
      type: "textarea",
      access: { update: () => false },
      admin: {
        readOnly: true,
        components: {
          Field: "@/payload/components/review-fields#ReviewSummary",
        },
      },
    },
    {
      name: "suggestedListing",
      type: "json",
      access: { update: () => false },
      admin: {
        readOnly: true,
        components: {
          Field: "@/payload/components/review-fields#ReviewSuggestedListing",
        },
      },
    },
    {
      name: "recommendation",
      label: "AI recommendation",
      type: "select",
      options: [
        "approve-as-submitted",
        "approve-with-edits",
        "request-information",
        "reject",
      ],
      access: { update: () => false },
      admin: {
        readOnly: true,
        components: {
          Field: "@/payload/components/review-fields#ReviewRecommendation",
        },
      },
    },
    {
      name: "failureReason",
      type: "textarea",
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "humanDecision",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        "pending",
        "accepted",
        "amended",
        "request-information",
        "rejected",
      ],
      admin: {
        description:
          "Rejecting or requesting information emails the submitter. Choose it, check the message below, then send.",
      },
    },
    {
      name: "draftMessage",
      label: "Message to the submitter",
      type: "textarea",
      admin: {
        description:
          "Drafted by the AI review. Edit it before sending a rejection or information request.",
      },
    },
    {
      name: "sendDecision",
      type: "ui",
      admin: {
        components: {
          Field:
            "@/payload/components/review-decision-email#ReviewDecisionEmail",
        },
      },
    },
    {
      name: "decisionEmailSentAt",
      label: "Decision emailed",
      type: "date",
      access: { create: () => false, update: () => false },
      admin: {
        readOnly: true,
        condition: (data) => Boolean(data.decisionEmailSentAt),
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      name: "decisionEmailSentBy",
      label: "Decision emailed by",
      type: "relationship",
      relationTo: "users",
      access: { create: () => false, update: () => false },
      admin: {
        readOnly: true,
        condition: (data) => Boolean(data.decisionEmailSentBy),
      },
    },
    {
      name: "decisionNotes",
      type: "textarea",
      admin: { description: "Optional notes explaining the human decision." },
    },
    {
      name: "decidedBy",
      type: "relationship",
      relationTo: "users",
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "decidedAt",
      type: "date",
      access: { update: () => false },
      admin: { readOnly: true },
    },
  ],
};
