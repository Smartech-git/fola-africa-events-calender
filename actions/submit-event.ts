"use server";

import { reviewAfterSubmission } from "@/payload/reviews/after-submission";
import {
  createEventSubmission,
  type SubmitEventResult,
} from "@/payload/submissions/submit-event";
import type { SubmitEventValues } from "@/validations/submit-event";

export type SubmitEventActionState = SubmitEventResult;

export async function submitEvent(
  _previousState: SubmitEventActionState,
  data: SubmitEventValues | null,
): Promise<SubmitEventActionState> {
  if (data === null) return { success: false, status: 0 };

  try {
    const result = await createEventSubmission(data);

    if (result.success) {
      reviewAfterSubmission();
      return result;
    }

    const error = Object.values(result.fieldErrors ?? {})
      .flatMap((messages) => messages ?? [])
      .join(" ");

    return {
      ...result,
      error:
        error ||
        result.error ||
        "We couldn't submit your event. Please try again.",
    };
  } catch {
    return {
      success: false,
      status: 500,
      error: "We couldn't submit your event. Please try again.",
    };
  }
}
