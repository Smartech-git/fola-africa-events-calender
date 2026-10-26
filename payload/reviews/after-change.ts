import { after } from "next/server";

export function reviewAfterChange(jobId: number | string) {
  try {
    after(async () => {
      try {
        // Load after the response so Payload config does not import its runner.
        const { runReviews } = await import("@/payload/reviews/run-reviews");
        await runReviews(1, jobId);
      } catch {
        console.error(
          "AI review runner failed; queued reviews will retry on the next scheduled run.",
        );
      }
    });
  } catch (error) {
    // CLI/Local API calls have no Next request lifecycle. Their durable jobs
    // are picked up by the scheduled runner or the reviews:run command.
    if (
      error &&
      typeof error === "object" &&
      "__NEXT_ERROR_CODE" in error &&
      error.__NEXT_ERROR_CODE === "E468"
    )
      return;
    console.error(
      "Unable to schedule the AI review; the review remains queued.",
    );
  }
}
