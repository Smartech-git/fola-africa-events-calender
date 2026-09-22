import { APIError, type CollectionConfig } from "payload";

import { adminField, isStaff, noAccess, roleOf } from "@/payload/access";

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
      "AI findings and the original listing are retained alongside the human decision. Administrators can update AI status or record a manual decision without AI review.",
  },
  access: {
    create: noAccess,
    read: isStaff,
    update: isStaff,
    delete: noAccess,
    readVersions: isStaff,
  },
  versions: { maxPerDoc: 30 },
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req, operation }) => {
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
            roleOf(req.user) !== "admin" &&
            (data.aiStatus || originalDoc?.aiStatus) !== "completed"
          )
            throw new APIError(
              "Complete the AI review before recording a human decision.",
              400,
            );
          if (!data.decisionNotes && !originalDoc?.decisionNotes)
            throw new APIError(
              "Record the reason for the human decision.",
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
          "Administrators can update this status manually. Manual event approval does not require marking AI review as completed.",
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
      admin: { readOnly: true },
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
      admin: { readOnly: true },
    },
    {
      name: "summary",
      type: "textarea",
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "suggestedListing",
      type: "json",
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "recommendation",
      type: "select",
      options: [
        "approve-as-submitted",
        "approve-with-edits",
        "request-information",
        "reject",
      ],
      access: { update: () => false },
      admin: { readOnly: true },
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
    { name: "decisionNotes", type: "textarea" },
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
