import { EMAIL_QUEUE, emailSettings } from "@/payload/emails/email-settings";
import { getCalendarPayload } from "@/payload/queries/calendar-query";

export async function runEmails(limit = 10, jobId?: number | string) {
  if (!emailSettings()) return { configured: false };
  const payload = await getCalendarPayload();
  await payload.update({
    collection: "payload-jobs",
    overrideAccess: true,
    where: {
      and: [
        { queue: { equals: EMAIL_QUEUE } },
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
    queue: EMAIL_QUEUE,
    limit,
    sequential: true,
    silent: true,
  });
  return { configured: true, remaining: result.remainingJobsFromQueried };
}
