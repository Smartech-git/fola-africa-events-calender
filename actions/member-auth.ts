"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  endMemberSession,
  getMember,
  startMemberSession,
} from "@/lib/auth/member-session";
import {
  redeemSignInLink,
  registerMember,
  revokeMemberSessions,
  sendSignInLink,
  updateMemberProfile,
} from "@/payload/members/member-auth";
import {
  createAccountSchema,
  profileSchema,
  safeNextPath,
  signInSchema,
  type CreateAccountValues,
  type ProfileValues,
  type SignInValues,
} from "@/validations/member-account";

export interface MemberActionState {
  status: "idle" | "sent" | "saved" | "error";
  email?: string;
  savedAt?: string;
  error?: string;
}

const SEND_ERROR =
  "We couldn’t send the email just now. Please try again in a moment.";

const firstIssue = (issues: { message: string }[]) =>
  issues[0]?.message ?? "Check the form and try again.";

export async function requestSignInLink(
  _previous: MemberActionState,
  data: SignInValues | null,
): Promise<MemberActionState> {
  if (data === null) return { status: "idle" };
  const parsed = signInSchema.safeParse(data);
  if (!parsed.success)
    return { status: "error", error: firstIssue(parsed.error.issues) };
  try {
    await sendSignInLink(parsed.data.email, parsed.data.next);
  } catch (error) {
    console.error("Sign-in link request failed", error);
    return { status: "error", error: SEND_ERROR };
  }
  // The same reply whether or not the address has an account.
  return { status: "sent", email: parsed.data.email };
}

export async function createAccount(
  _previous: MemberActionState,
  data: CreateAccountValues | null,
): Promise<MemberActionState> {
  if (data === null) return { status: "idle" };
  const parsed = createAccountSchema.safeParse(data);
  if (!parsed.success)
    return { status: "error", error: firstIssue(parsed.error.issues) };
  try {
    await registerMember(parsed.data);
  } catch (error) {
    console.error("Account creation failed", error);
    return { status: "error", error: SEND_ERROR };
  }
  return { status: "sent", email: parsed.data.email };
}

/** The Continue button on the page the emailed link opens. */
export async function completeSignIn(
  _previous: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const token = String(formData.get("token") ?? "");
  const member = await redeemSignInLink(token).catch((error) => {
    console.error("Sign-in link redemption failed", error);
    return null;
  });
  if (!member)
    return {
      status: "error",
      error:
        "This link has expired or has already been used. Send a new one below.",
    };
  await startMemberSession(member);
  redirect(safeNextPath(formData.get("next")) ?? "/account");
}

export async function saveProfile(
  _previous: MemberActionState,
  data: ProfileValues | null,
): Promise<MemberActionState> {
  if (data === null) return { status: "idle" };
  const member = await getMember();
  if (!member)
    return {
      status: "error",
      error: "You’ve been signed out. Sign in again to save your profile.",
    };
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success)
    return { status: "error", error: firstIssue(parsed.error.issues) };
  try {
    await updateMemberProfile(member, parsed.data);
  } catch (error) {
    console.error("Profile update failed", error);
    return {
      status: "error",
      error: "We couldn’t save your profile. Please try again.",
    };
  }
  revalidatePath("/account", "layout");
  return { status: "saved", savedAt: new Date().toISOString() };
}

export async function signOut() {
  await endMemberSession();
  redirect("/");
}

/** Ends every session, on every device, including this one. */
export async function signOutEverywhere() {
  const member = await getMember();
  if (member) await revokeMemberSessions(member);
  await endMemberSession();
  redirect("/sign-in");
}
