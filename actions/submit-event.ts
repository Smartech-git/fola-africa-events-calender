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
    // Only signed-in members can submit; it appears under My Happenings.
    const member = await getMember();
    if (!member)
      return {
        success: false,
        status: 401,
        error: "Sign in or create an account to submit a happening.",
      };
    const result = await createEventSubmission(data, { memberId: member.id });

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
