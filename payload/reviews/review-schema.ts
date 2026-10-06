import { z } from "zod";

export const REVIEW_QUEUE = "event-reviews";
export const REVIEW_RETRIES = 5;

export const reviewSchema = z.strictObject({
  summary: z.string(),
  recommendation: z.enum([
    "approve-as-submitted",
    "approve-with-edits",
    "request-information",
    "reject",
  ]),
  findings: z.strictObject({
    concerns: z.array(
      z.strictObject({
        field: z.string(),
        severity: z.enum(["info", "warning", "error"]),
        message: z.string(),
      }),
    ),
    duplicateEventIds: z.array(z.number().int()),
    clashingEventIds: z.array(z.number().int()),
    organiserMatchIds: z.array(z.number().int()),
    venueMatchIds: z.array(z.number().int()),
  }),
  suggestedListing: z.strictObject({
    title: z.string().nullable(),
    description: z.string().nullable(),
    changes: z.array(
      z.strictObject({
        field: z.string(),
        suggestion: z.string(),
        reason: z.string(),
      }),
    ),
  }),
  draftMessage: z.string().nullable(),
});

export type ReviewResult = z.infer<typeof reviewSchema>;
