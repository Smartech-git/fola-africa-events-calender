import type { GlobalConfig } from "payload";

import { isAdmin, isStaff } from "@/payload/access";
import { DEFAULT_REVIEW_PROMPT } from "@/payload/constants";
import { REVIEW_MODEL } from "@/payload/reviews/review-schema";

export const ReviewSettings: GlobalConfig = {
  slug: "review-settings",
  label: "AI review settings",
  admin: {
    group: "Review",
    description:
      "Groq reviews submitted events and suggests edits. Staff make publication decisions. API credentials stay in server environment variables.",
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
      defaultValue: REVIEW_MODEL,
      hooks: {
        beforeValidate: [() => REVIEW_MODEL],
        afterRead: [() => REVIEW_MODEL],
      },
      admin: {
        readOnly: true,
        description:
          "GPT-OSS 120B on Groq. The worker uses this model with strict structured output.",
      },
    },
  ],
};
