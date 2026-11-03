import { APIError, type CollectionConfig } from "payload";

import { isAdmin, isStaff, noAccess, roleOf } from "@/payload/access";
import {
  applyChangeRequest,
  queueChangeDecisionEmail,
} from "@/payload/members/happening-changes";

/**
 * Members' edits to a live (or approved) happening. The live listing is left
 * alone until an administrator approves the request, so the calendar never
 * shows unreviewed details. Approving copies the changes onto the event.
 */
export const eventChanges: CollectionConfig = {
  slug: "event-changes",
  labels: { singular: "Change request", plural: "Change requests" },
  admin: {
    useAsTitle: "summary",
    group: "Review",
    defaultColumns: ["summary", "event", "status", "updatedAt"],
    description:
      "Changes members submitted to their live happenings. The live listing stays as it is until you approve. Approving applies the changes; declining tells the member why.",
  },
  access: {
    // Created only by the member edit flow on the server.
    create: noAccess,
    read: isStaff,
    update: isAdmin,
    delete: noAccess,
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        if (operation !== "update" || !originalDoc) return data;
        const decided = data.status && data.status !== originalDoc.status;
        if (!decided) return data;
        if (originalDoc.status !== "pending")
          throw new APIError(
            "This change request has already been decided.",
            400,
          );
        if (["approved", "declined"].includes(data.status)) {
          // Public submissions are only approved by administrators.
          if (roleOf(req.user) !== "admin")
            throw new APIError(
              "Only an administrator can decide changes.",
              403,
            );
          data.reviewedBy = req.user!.id;
          data.reviewedAt = new Date().toISOString();
        }
        if (data.status === "approved")
          await applyChangeRequest({ ...originalDoc, ...data }, req);
        if (data.status === "declined" && !data.declineReason?.trim())
          throw new APIError(
            "Add a reason for declining; the member will see it.",
            400,
          );
        return data;
      },
    ],
    afterChange: [queueChangeDecisionEmail],
  },
  fields: [
    {
      name: "summary",
      type: "text",
      admin: { readOnly: true, description: "The fields that change." },
    },
    {
      name: "event",
      type: "relationship",
      relationTo: "events",
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: "member",
      type: "relationship",
      relationTo: "members",
      admin: { readOnly: true },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      index: true,
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Declined", value: "declined" },
        { label: "Withdrawn by the member", value: "withdrawn" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "note",
      label: "Note from the member",
      type: "textarea",
      admin: { readOnly: true },
    },
    {
      name: "previous",
      label: "Before",
      type: "json",
      // Shown inside the "changes" table below, not on its own.
      admin: { readOnly: true, hidden: true },
    },
    {
      name: "changes",
      label: "After",
      type: "json",
      admin: {
        readOnly: true,
        components: {
          Field: "@/payload/components/change-request-diff#ChangeRequestDiff",
        },
      },
    },
    {
      name: "venueRecord",
      label: "Venue record",
      type: "relationship",
      relationTo: "venues",
      admin: {
        description:
          "Required when the venue changes: choose the venue in the event's city, or create it in Venues first.",
      },
    },
    {
      name: "organiserConfirmed",
      label: "Organiser confirmed the private listing",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Required when the change makes the happening Private or Invitation only.",
      },
    },
    {
      name: "declineReason",
      label: "Reason for declining",
      type: "textarea",
      admin: { description: "Sent to the member when you decline." },
    },
    {
      name: "reviewedBy",
      type: "relationship",
      relationTo: "users",
      access: { create: () => false, update: () => false },
      admin: { readOnly: true, position: "sidebar" },
    },
    {
      name: "reviewedAt",
      type: "date",
      access: { create: () => false, update: () => false },
      admin: { readOnly: true, position: "sidebar" },
    },
  ],
};
