import { z } from "zod";

import { SITE_NAME } from "@/constants/brand";

export const EMAIL_QUEUE = "event-emails";
export const EMAIL_RETRIES = 5;

export const emailMessageSchema = z.object({
  from: z.string(),
  to: z.email(),
  replyTo: z.email().optional(),
  subject: z.string(),
  html: z.string(),
  text: z.string(),
});

export type EmailMessage = z.infer<typeof emailMessageSchema>;
export type EventEmailKind = "submitted" | "published" | "team";

const DEFAULT_API_URL = "api.zeptomail.com/";

/** ZeptoMail (Zoho CPaaS) sending settings, or null when they are not configured. */
export function emailSettings() {
  // Accept the misspelt "CPASS" name as well, so either spelling works.
  const key = (
    process.env.ZOHO_CPAAS_API_KEY || process.env.ZOHO_CPASS_API_KEY
  )?.trim();
  const sender = process.env.ZOHO_CPAAS_SENDER?.trim();
  if (!key || !sender || !z.email().safeParse(sender).success) return null;
  // The SDK sends the token as the whole Authorization header.
  const token = key.startsWith("Zoho-enczapikey ")
    ? key
    : `Zoho-enczapikey ${key}`;
  return {
    token,
    url: process.env.ZOHO_CPAAS_API_URL?.trim() || DEFAULT_API_URL,
    sender,
    senderName: SITE_NAME,
  };
}

export function emailSiteUrl() {
  const value = process.env.BASE_URL;
  if (!value) throw new Error("BASE_URL is required for notification emails.");
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol))
    throw new Error("BASE_URL must be an HTTP(S) website URL.");
  return url;
}
