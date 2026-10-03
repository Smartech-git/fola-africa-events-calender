import { after } from "next/server";

export function emailAfterChange(jobId: number | string) {
  try {
    after(async () => {
      try {
        // Load after the response so Payload config does not import its runner.
        const { runEmails } = await import("@/payload/emails/run-emails");
        await runEmails(1, jobId);
      } catch {
        console.error(
          "Email runner failed; queued notifications will retry on the next scheduled run.",
        );
      }
    });
  } catch (error) {
    // CLI/Local API calls have no Next request lifecycle. Their durable jobs
    // are picked up by the scheduled runner or the emails:run command.
    if (
      error &&
      typeof error === "object" &&
      "__NEXT_ERROR_CODE" in error &&
      error.__NEXT_ERROR_CODE === "E468"
    )
      return;
    console.error(
      "Unable to schedule email delivery; the notification remains queued.",
    );
  }
}
