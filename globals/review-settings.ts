import type { GlobalConfig } from "payload";

import { isAdmin, isStaff } from "../lib/calendar/access";
import { DEFAULT_REVIEW_PROMPT } from "../lib/calendar/constants";

export const ReviewSettings: GlobalConfig = {
  slug: "review-settings",
  label: "AI review settings",
  admin: {
    group: "Review",
    description:
      "Prompt configuration for the future Anthropic review worker. No credentials are stored in this document.",
  },
  access: { read: isStaff, update: isAdmin, readVersions: isStaff },
  versions: { max: 30 },
  fields: [
    {
      name: "promptVersion",
      type: "text",
      required: true,
      defaultValue: "fola-beta-v1",
    },
    {
      name: "systemPrompt",
      type: "textarea",
      required: true,
      defaultValue: DEFAULT_REVIEW_PROMPT,
    },
    {
      name: "model",
      type: "text",
      admin: {
        description:
          "Set a supported Anthropic model when enabling the review worker.",
      },
    },
    {
      name: "turnaroundWorkingDays",
      type: "number",
      required: true,
      defaultValue: 2,
      min: 1,
    },
    {
      name: "minimumVerifiedEventsPerCity",
      type: "number",
      required: true,
      defaultValue: 25,
      min: 1,
    },
  ],
};
