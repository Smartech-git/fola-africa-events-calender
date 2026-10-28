import { SendMailClient } from "zeptomail";

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

export type ZeptoMailMessage = Parameters<SendMailClient["sendMail"]>[0];
type ZeptoAddress = NonNullable<ZeptoMailMessage["reply_to"]>[number];

const SEND_TIMEOUT_MS = 20_000;

/** ZeptoMail treats the display name as optional; leave it out rather than send "". */
export function zeptoAddress(address: string, name?: string): ZeptoAddress {
  return (name ? { address, name } : { address }) as ZeptoAddress;
}

function rejectionReason(error: unknown) {
  if (!error || typeof error !== "object" || !("error" in error)) return null;
  const body = error.error;
  if (!body || typeof body !== "object") return "ZeptoMail rejected the email.";
  const message =
    "message" in body && typeof body.message === "string" ? body.message : "";
  const code = "code" in body && typeof body.code === "string" ? body.code : "";
  const details =
    "details" in body && Array.isArray(body.details)
      ? body.details
          .map((detail: unknown) =>
            detail &&
            typeof detail === "object" &&
            "message" in detail &&
            typeof detail.message === "string"
              ? detail.message
              : "",
          )
          .filter(Boolean)
          .join(" ")
      : "";
  return (
    [code, message, details].filter(Boolean).join(" · ") ||
    "ZeptoMail rejected the email."
  );
}

/**
 * Sends through ZeptoMail (Zoho CPaaS) and returns its request ID.
 *
 * ZeptoMail has no idempotency key, so `definitelyRejected` tells callers whether
 * a retry is safe. The SDK rejects with ZeptoMail's JSON error body when the API
 * refuses a request, and with a plain string when validation fails before sending:
 * nothing was sent in either case. Timeouts and network errors leave delivery
 * uncertain, because the request may still have reached ZeptoMail.
 */
export async function sendZeptoMail(message: ZeptoMailMessage) {
  const settings = emailSettings();
  if (!settings)
    throw new EmailDeliveryError(
      "ZeptoMail email settings are not configured.",
      true,
    );
  const client = new SendMailClient({
    url: settings.url,
    token: settings.token,
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new EmailDeliveryError(
            "ZeptoMail did not respond in time; delivery is uncertain.",
            false,
          ),
        ),
      SEND_TIMEOUT_MS,
    );
  });
  try {
    const result: unknown = await Promise.race([
      client.sendMail(message),
      timeout,
    ]);
    return result &&
      typeof result === "object" &&
      "request_id" in result &&
      typeof result.request_id === "string"
      ? result.request_id
      : null;
  } catch (error) {
    if (error instanceof EmailDeliveryError) throw error;
    const reason = rejectionReason(error);
    if (reason) throw new EmailDeliveryError(reason, true);
    if (typeof error === "string")
      throw new EmailDeliveryError(`Invalid email request: ${error}`, true);
    throw new EmailDeliveryError(
      "Could not reach ZeptoMail; delivery is uncertain.",
      false,
    );
  } finally {
    clearTimeout(timer);
  }
}

/** Sends a saved notification snapshot. `reference` lets staff find it in the ZeptoMail logs. */
export async function sendEventEmail(message: EmailMessage, reference: string) {
  const settings = emailSettings();
  if (!settings)
    throw new EmailDeliveryError(
      "ZeptoMail email settings are not configured.",
      true,
    );
  return sendZeptoMail({
    from: { address: settings.sender, name: settings.senderName },
    to: [{ email_address: zeptoAddress(message.to) }],
    ...(message.replyTo ? { reply_to: [zeptoAddress(message.replyTo)] } : {}),
    subject: message.subject,
    htmlbody: message.html,
    textbody: message.text,
    client_reference: reference,
  });
}
