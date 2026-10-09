import { z } from "zod";

import { SITE_NAME } from "@/constants/brand";

export const EMAIL_QUEUE = "event-emails";
export const EMAIL_RETRIES = 5;

export const emailMessageSchema = z.object({
  from: z.string(),
  to: z.email(),
  subject: z.string(),
  html: z.string(),
  text: z.string(),
});

export type EmailMessage = z.infer<typeof emailMessageSchema>;
export type EventEmailKind = "submitted" | "published";

export function emailSettings() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const sender = process.env.RESEND_EMAIL_URL?.trim();
  if (!apiKey || !sender || !z.email().safeParse(sender).success) return null;
  return { apiKey, sender, senderName: SITE_NAME };
}

export function emailSiteUrl() {
  const value = process.env.BASE_URL;
  if (!value) throw new Error("BASE_URL is required for publication emails.");
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol))
    throw new Error("BASE_URL must be an HTTP(S) website URL.");
  return url;
}
