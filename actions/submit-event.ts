"use server";

import { getMember } from "@/lib/auth/member-session";
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
    // Signed-in members see the submission under My Happenings.
    const member = await getMember();
    const result = await createEventSubmission(data, { memberId: member?.id });

    if (result.success) return result;

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
