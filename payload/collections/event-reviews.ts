import { APIError, type CollectionConfig } from "payload";

import {
  adminField,
  isAdmin,
  isStaff,
  noAccess,
  roleOf,
} from "@/payload/access";
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
  versions: { maxPerDoc: 30 },
  hooks: {
    afterChange: [enqueueReview],
    beforeChange: [
      async ({ data, originalDoc, req, operation }) => {
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
          if (
            publicSubmission &&
            data.aiStatus === "completed" &&
            originalDoc?.aiStatus !== "completed"
          )
            throw new APIError(
              "Only the AI worker can complete a public submission's review.",
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
          "Groq processes queued reviews. To retry a failed review, set this to Pending. Public submissions cannot be approved until AI review completes.",
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
    { name: "draftMessage", type: "textarea" },
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
