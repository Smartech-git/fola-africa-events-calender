import {
  emailSettings,
  type EmailMessage,
} from "@/payload/emails/email-settings";

export class EmailDeliveryError extends Error {
  constructor(
    message: string,
    public readonly definitelyRejected: boolean,
  ) {
    super(message);
  }
}

// Payload's Resend adapter does not expose the HTTP Idempotency-Key header.
// Use the same provider/settings here, with a stable key for notification retries.
export async function sendEventEmail(message: EmailMessage, key: string) {
  const settings = emailSettings();
  if (!settings) throw new Error("Resend email settings are not configured.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": key,
    },
    body: JSON.stringify(message),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok)
    throw new EmailDeliveryError(
      `Email provider request failed (HTTP ${response.status}).`,
      response.status >= 400 &&
        response.status < 500 &&
        response.status !== 409,
    );
  const result: unknown = await response.json();
  if (
    !result ||
    typeof result !== "object" ||
    !("id" in result) ||
    typeof result.id !== "string"
  )
    throw new Error("Email provider returned no message ID.");
  return result.id;
}
