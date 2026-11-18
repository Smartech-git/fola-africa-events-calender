"use server";

import { addSubscriber } from "@/payload/subscribers/subscriptions";
import { subscribeSchema } from "@/validations/email-subscription";

export interface SubscribeState {
  status: "idle" | "subscribed" | "error";
  error?: string;
}

/**
 * The newsletter popup. The reply is the same whether or not the address was
 * already subscribed or belongs to a member, so it reveals nothing.
 */
export async function subscribeToEmails(
  _previous: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email") ?? "",
    company: formData.get("company") ?? "",
  });
  if (!parsed.success)
    return {
      status: "error",
      error: parsed.error.issues[0]?.message ?? "Enter a valid email address.",
    };
  // Honeypot filled: pretend it worked and store nothing.
  if (parsed.data.company) return { status: "subscribed" };
  try {
    await addSubscriber(parsed.data.email, "popup");
  } catch (error) {
    console.error("Email subscription failed", error);
    return {
      status: "error",
      error: "We couldn’t subscribe you just now. Please try again.",
    };
  }
  return { status: "subscribed" };
}
