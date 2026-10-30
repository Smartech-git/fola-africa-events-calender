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

/** Only same-site paths, so a sign-in link can never send someone elsewhere. */
export function safeNextPath(value: unknown) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\")
    ? value
    : undefined;
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
