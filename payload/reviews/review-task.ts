import type { CollectionAfterChangeHook, TaskConfig } from "payload";

import { DEFAULT_REVIEW_PROMPT } from "@/payload/constants";
import {
  buildReviewPrompt,
  AnthropicReviewError,
  anthropicReview,
} from "@/payload/reviews/anthropic-review";
import { reviewModel } from "@/payload/reviews/anthropic-settings";
import { matchesSnapshot } from "@/payload/reviews/event-snapshot";
import {
  reviewContext,
  validateReviewMatches,
} from "@/payload/reviews/review-context";
import { REVIEW_QUEUE, REVIEW_RETRIES } from "@/payload/reviews/review-schema";
import { relationID } from "@/payload/validation";

export const enqueueReview: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (
    req.context.aiReviewWorker ||
    doc.aiStatus !== "pending" ||
    doc.humanDecision !== "pending" ||
    (operation !== "create" && previousDoc?.aiStatus === "pending")
  )
    return doc;
  const event = await req.payload.findByID({
    collection: "events",
    id: relationID(doc.event)!,
    depth: 0,
    req,
  });
  if (!event.isDemo)
    await req.payload.jobs.queue({
      task: "review-event",
      queue: REVIEW_QUEUE,
      input: { reviewId: doc.id },
      req,
    });
  return doc;
};

export const reviewEventTask: TaskConfig<{
  input: { reviewId: number };
  output: Record<string, never>;
}> = {
  slug: "review-event",
  label: "Review event with Anthropic",
  inputSchema: [{ name: "reviewId", type: "number", required: true }],
  concurrency: ({ input }) => `review-${input.reviewId}`,
  retries: {
    attempts: REVIEW_RETRIES,
    backoff: { type: "exponential", delay: 60_000 },
  },
  handler: async ({ input, req, job }) => {
    const { payload } = req;
    const reviews = await payload.find({
      collection: "event-reviews",
      where: { id: { equals: input.reviewId } },
      limit: 1,
      depth: 0,
      req,
    });
    const review = reviews.docs[0];
    if (
      !review ||
      review.aiStatus === "completed" ||
      review.humanDecision !== "pending"
    )
      return { output: {} };
    const events = await payload.find({
      collection: "events",
      where: { id: { equals: relationID(review.event) } },
      limit: 1,
      depth: 0,
      req,
    });
    const event = events.docs[0];
    const update = async (data: Partial<typeof review>) => {
      const result = await payload.update({
        collection: "event-reviews",
        where: {
          and: [
            { id: { equals: review.id } },
            { humanDecision: { equals: "pending" } },
          ],
        },
        data,
        depth: 0,
        req,
        overrideAccess: true,
        context: { aiReviewWorker: true },
      });
      if (result.errors.length) throw new Error("Unable to save AI review.");
      return result;
    };
    if (
      !event ||
      event.isDemo ||
      event.status !== "submitted" ||
      !matchesSnapshot(event, review.originalListing)
    ) {
      await update({
        aiStatus: "failed",
        failureReason:
          "Review skipped: the event was changed, removed, already approved, or is demo data.",
      });
      return { output: {} };
    }
    try {
      const settings = await payload.findGlobal({
        slug: "review-settings",
        req,
      });
      const prompt = buildReviewPrompt(
        settings.systemPrompt || DEFAULT_REVIEW_PROMPT,
      );
      const model = reviewModel();
      const started = await update({
        aiStatus: "processing",
        failureReason: null,
        model,
        promptVersion: settings.promptVersion || "fola-beta-v1",
        promptSnapshot: prompt,
      });
      if (!started.docs.length) return { output: {} };
      const context = await reviewContext(event, req);
      const result = await anthropicReview(prompt, context, model);
      validateReviewMatches(result, context);
      const current = await payload.find({
        collection: "events",
        where: { id: { equals: event.id } },
        depth: 0,
        limit: 1,
        req,
      });
      if (
        !current.docs[0] ||
        current.docs[0].status !== "submitted" ||
        !matchesSnapshot(current.docs[0], review.originalListing)
      ) {
        await update({
          aiStatus: "failed",
          failureReason:
            "Event changed during AI review. Use the review for the latest event details.",
        });
        return { output: {} };
      }
      await update({ ...result, aiStatus: "completed", failureReason: null });
      return { output: {} };
    } catch (error) {
      const message =
        error instanceof AnthropicReviewError
          ? error.message
          : "AI review could not be completed. Check configuration or retry the review.";
      if (error instanceof AnthropicReviewError && error.retryAt)
        job.waitUntil = error.retryAt;
      await update({
        aiStatus:
          (job.totalTried ?? 0) >= REVIEW_RETRIES ? "failed" : "pending",
        failureReason: message,
      });
      throw new Error(message);
    }
  },
};
