import { BREVO_QUEUE, brevoConfigured } from "@/payload/members/brevo";
import { getCalendarPayload } from "@/payload/queries/calendar-query";

/** Runs queued Brevo syncs: one job straight after a change, or a batch from the cron. */
export async function runBrevoSync(limit = 25, jobId?: number | string) {
  if (!brevoConfigured()) return { configured: false };
  const payload = await getCalendarPayload();
  // Release jobs left "processing" by a function that timed out.
  await payload.update({
    collection: "payload-jobs",
    overrideAccess: true,
    where: {
      and: [
        { queue: { equals: BREVO_QUEUE } },
        { processing: { equals: true } },
        {
          updatedAt: {
            less_than: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          },
        },
      ],
    },
    data: { processing: false },
  });
  const result = await payload.jobs.run({
    ...(jobId ? { where: { id: { equals: jobId } } } : {}),
    queue: BREVO_QUEUE,
    limit,
    sequential: true,
    silent: true,
  });
  return { configured: true, remaining: result.remainingJobsFromQueried };
}
