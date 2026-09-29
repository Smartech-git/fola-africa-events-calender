import { after } from "next/server";

import { runReviews } from "@/payload/reviews/run-reviews";

export function reviewAfterSubmission() {
  after(async () => {
    try {
      await runReviews();
    } catch {
      console.error(
        "AI review runner failed; queued reviews will retry on the next scheduled run.",
      );
    }
  });
}
