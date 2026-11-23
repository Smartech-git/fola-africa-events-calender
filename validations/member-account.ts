import * as z from "zod";

import { COUNTRY_OPTIONS } from "@/constants/countries";
import { INDUSTRIES, MEMBER_TYPES } from "@/payload/constants";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address.")
  .max(254)
  .pipe(z.email("Enter a valid email address."));
const text = z.string().trim().max(200);
const requiredText = (message: string) => text.min(1, message);
const optionalChoice = (options: { value: string }[], message: string) =>
  z
    .string()
    .refine(
      (value) => !value || options.some((option) => option.value === value),
      message,
    );

const NEXT_BASE = "https://same-site.invalid";

/**
 * Only same-site paths, so a sign-in link can never send someone elsewhere.
 * Browsers drop tabs and line breaks from URLs and read "\" as "/", so values
 * with those are refused; the rest is resolved the way a browser would and
 * kept only if it stays on this site.
 */
export function safeNextPath(value: unknown) {
  if (typeof value !== "string" || value.length > 500) return undefined;
  if (!value.startsWith("/") || /[\u0000-\u001f\u007f\\]/.test(value))
    return undefined;
  try {
    const url = new URL(value, NEXT_BASE);
    // Resolving can turn "/..//host" into "//host", which is another site.
    if (url.origin !== NEXT_BASE || url.pathname.startsWith("//"))
      return undefined;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return undefined;
  }
}

export const signInSchema = z.object({
  email,
  next: z.string().max(500).optional(),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const profileSchema = z.object({
  fullName: requiredText("Enter your full name."),
  phone: z
    .string()
    .trim()
    .min(5, "Enter a phone or WhatsApp number.")
    .max(40)
    .regex(/^\+?[\d\s().-]+$/, "Enter a valid phone or WhatsApp number."),
  organisation: text,
  role: text,
  industry: optionalChoice(INDUSTRIES, "Choose an industry."),
  city: z.union([z.literal(""), z.string().regex(/^[1-9]\d*$/)]),
  country: optionalChoice(COUNTRY_OPTIONS, "Choose a country."),
  describes: optionalChoice(MEMBER_TYPES, "Choose what best describes you."),
  marketingConsent: z.boolean(),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const createAccountSchema = profileSchema.extend({
  email,
  terms: z.literal(true, "Agree to the Terms and Privacy Policy to continue."),
  next: z.string().max(500).optional(),
});
export type CreateAccountValues = z.infer<typeof createAccountSchema>;

export const profileDefaults: ProfileValues = {
  fullName: "",
  phone: "",
  organisation: "",
  role: "",
  industry: "",
  city: "",
  country: "",
  describes: "",
  marketingConsent: false,
};
