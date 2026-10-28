import type { GlobalConfig } from "payload";

import { isAdmin, isStaff } from "@/payload/access";

export const DEFAULT_SUBMISSION_RECIPIENT = "hello@happeningsofafrica.com";

export const NotificationSettings: GlobalConfig = {
  slug: "notification-settings",
  label: "Notification settings",
  admin: {
    group: "Notifications",
    description:
      "Who the Happenings team emails when an event is submitted. Each address gets its own copy, with the submitter set as the reply-to.",
  },
  access: { read: isStaff, update: isAdmin },
  fields: [
    {
      name: "submissionRecipients",
      label: "Submission alert recipients",
      type: "array",
      labels: { singular: "Recipient", plural: "Recipients" },
      defaultValue: [{ email: DEFAULT_SUBMISSION_RECIPIENT }],
      admin: {
        description:
          "Emailed as soon as a new event is submitted through the public form. Leave empty to stop these alerts.",
      },
      fields: [{ name: "email", type: "email", required: true }],
    },
  ],
};
