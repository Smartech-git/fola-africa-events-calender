"use server";

import { revalidatePath } from "next/cache";

import { getMember } from "@/lib/auth/member-session";
import {
  changeHappeningStatus,
  discardHappeningChanges,
  saveHappeningEdits,
  withdrawHappening,
  type EditResult,
} from "@/payload/members/happening-edits";
import { cancelHappeningSchema } from "@/validations/happening-edit";

const SIGNED_OUT: EditResult = {
  ok: false,
  error: "You’ve been signed out. Sign in again to continue.",
};
const FAILED: EditResult = {
  ok: false,
  error: "We couldn’t save that just now. Please try again.",
};

async function run(eventId: number, task: () => Promise<EditResult>) {
  if (!Number.isInteger(eventId) || eventId < 1)
    return { ok: false, error: "Unknown happening." } satisfies EditResult;
  try {
    const result = await task();
    if (result.ok) {
      revalidatePath("/account", "layout");
      revalidatePath("/calendar", "layout");
    }
    return result;
  } catch (error) {
    console.error("Happening edit failed", error);
    return FAILED;
  }
}

export async function saveHappening(eventId: number, values: unknown) {
  const member = await getMember();
  if (!member) return SIGNED_OUT;
  return run(eventId, () => saveHappeningEdits(member, eventId, values));
}

export async function discardChanges(eventId: number) {
  const member = await getMember();
  if (!member) return SIGNED_OUT;
  return run(eventId, () => discardHappeningChanges(member, eventId));
}

export async function withdrawSubmission(eventId: number) {
  const member = await getMember();
  if (!member) return SIGNED_OUT;
  return run(eventId, () => withdrawHappening(member, eventId));
}

export async function setHappeningStatus(
  eventId: number,
  status: "cancelled" | "postponed",
  input: unknown,
) {
  const member = await getMember();
  if (!member) return SIGNED_OUT;
  if (!["cancelled", "postponed"].includes(status))
    return { ok: false, error: "Unknown change." } satisfies EditResult;
  const parsed = cancelHappeningSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "Keep the note under 1,000 characters." };
  return run(eventId, () =>
    changeHappeningStatus(member, eventId, status, parsed.data.note),
  );
}
