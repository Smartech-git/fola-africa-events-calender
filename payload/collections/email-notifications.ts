import type { CollectionConfig } from "payload";

import { isAdmin, noAccess } from "@/payload/access";

export const emailNotifications: CollectionConfig = {
  slug: "email-notifications",
  admin: {
    useAsTitle: "key",
    group: "Notifications",
    defaultColumns: [
      "eventId",
      "kind",
      "recipient",
      "status",
      "sentAt",
      "createdAt",
    ],
    description:
      "Private delivery records for publication emails, submission alerts to the team and historical submission receipts. Sent through ZeptoMail. A failure marked uncertain may have been delivered: check the ZeptoMail logs before sending again.",
  },
  access: {
    create: noAccess,
    read: isAdmin,
    update: noAccess,
    delete: noAccess,
  },
  fields: [
    {
      name: "key",
      type: "text",
      required: true,
      unique: true,
      admin: { readOnly: true },
    },
    {
      name: "eventId",
      type: "number",
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: "kind",
      type: "select",
      required: true,
      options: ["submitted", "published", "team"],
      admin: { readOnly: true },
    },
    {
      name: "recipient",
      type: "email",
      admin: {
        readOnly: true,
        description:
          "Set for team alerts. Publication emails go to the submitter.",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "queued",
      options: ["queued", "sent", "skipped", "failed"],
      admin: { readOnly: true },
    },
    { name: "message", type: "json", admin: { hidden: true } },
    { name: "firstAttemptAt", type: "date", admin: { readOnly: true } },
    { name: "sentAt", type: "date", admin: { readOnly: true } },
    { name: "providerId", type: "text", admin: { readOnly: true } },
    { name: "failureReason", type: "textarea", admin: { readOnly: true } },
  ],
};
