import { getCalendarPayload } from "@/payload/queries/calendar-query";
import { REVIEW_QUEUE } from "@/payload/reviews/review-schema";

export async function runReviews(limit = 1) {
  if (!process.env.ANTHROPIC_API_KEY?.trim()) return { configured: false };
  const payload = await getCalendarPayload();
  // Recover jobs left running if Vercel terminated an invocation.
  await payload.update({
    collection: "payload-jobs",
    where: {
      and: [
        { queue: { equals: REVIEW_QUEUE } },
        { processing: { equals: true } },
        {
          updatedAt: {
            less_than: new Date(Date.now() - 600_000).toISOString(),
          },
        },
      ],
    },
    data: { processing: false },
    overrideAccess: true,
  });
  const result = await payload.jobs.run({
    queue: REVIEW_QUEUE,
    limit,
    sequential: true,
    silent: true,
  });
  return { configured: true, remaining: result.remainingJobsFromQueried };
}
