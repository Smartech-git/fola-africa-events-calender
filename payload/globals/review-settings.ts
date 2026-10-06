import type { GlobalConfig } from "payload";

import { isAdmin, isStaff } from "@/payload/access";
import { DEFAULT_REVIEW_PROMPT } from "@/payload/constants";
import { reviewModel } from "@/payload/reviews/anthropic-settings";

export const ReviewSettings: GlobalConfig = {
  slug: "review-settings",
  label: "AI review settings",
  admin: {
    group: "Review",
    description:
      "Anthropic reviews submitted events and suggests edits. Staff make publication decisions. API credentials stay in server environment variables.",
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
      defaultValue: reviewModel(),
      hooks: {
        beforeValidate: [() => reviewModel()],
        afterRead: [() => reviewModel()],
      },
      admin: {
        readOnly: true,
        description:
          "Claude on Anthropic with strict structured output. Set ANTHROPIC_MODEL in the server environment to override the default model.",
      },
    },
  ],
};
