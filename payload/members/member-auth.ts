import "server-only";

import { createHash, randomBytes } from "crypto";

import { after } from "next/server";

import type { Payload } from "payload";

import { LINK_MINUTES, RESEND_SECONDS } from "@/constants/account";
import { emailSettings, emailSiteUrl } from "@/payload/emails/email-settings";
import { sendZeptoMail, zeptoAddress } from "@/payload/emails/send-event-email";
import { signInEmailTemplate } from "@/payload/emails/sign-in-email-template";
import { getCalendarPayload } from "@/payload/queries/calendar-query";
import type { Member } from "@/payload-types";
import {
  safeNextPath,
  type CreateAccountValues,
  type ProfileValues,
} from "@/validations/member-account";

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

// Only these server functions read or write member records; members are never
// Payload users, so every call overrides collection access deliberately.
const trusted = { depth: 0, overrideAccess: true, joins: false } as const;

async function findMember(payload: Payload, email: string) {
  const result = await payload.find({
    collection: "members",
    where: { email: { equals: email.trim().toLowerCase() } },
    limit: 1,
    ...trusted,
  });
  return result.docs[0] ?? null;
}

const recentlySent = (member: Member) =>
  Boolean(member.loginTokenIssuedAt) &&
  Date.now() - Date.parse(member.loginTokenIssuedAt!) < RESEND_SECONDS * 1000;

/**
 * Stores a new link (replacing any earlier one) and emails it. Only the hash is
 * stored, so a database leak cannot be used to sign in.
 */
function mailSettings() {
  const settings = emailSettings();
  if (!settings) throw new Error("Email sending is not configured.");
  return settings;
}

async function issueLink(
  payload: Payload,
  member: Member,
  next: string | undefined,
  newAccount: boolean,
) {
  const settings = mailSettings();
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  await payload.update({
    collection: "members",
    id: member.id,
    ...trusted,
    data: {
      loginTokenHash: hashToken(token),
      loginTokenIssuedAt: new Date(now).toISOString(),
      loginTokenExpiresAt: new Date(now + LINK_MINUTES * 60_000).toISOString(),
    },
  });
  const url = new URL("/sign-in/continue", emailSiteUrl());
  url.searchParams.set("token", token);
  const safeNext = safeNextPath(next);
  if (safeNext) url.searchParams.set("next", safeNext);
  const message = signInEmailTemplate({
    name: member.fullName,
    url: url.href,
    minutes: LINK_MINUTES,
    newAccount,
  });
  await sendZeptoMail({
    from: { address: settings.sender, name: settings.senderName },
    to: [{ email_address: zeptoAddress(member.email, member.fullName) }],
    subject: message.subject,
    htmlbody: message.html,
    textbody: message.text,
    client_reference: `fola/sign-in/${member.id}/${now}`,
  });
}

/**
 * Sends after the response, so the reply takes the same time whether or not
 * the address has an account. Failures are logged; the member can resend.
 */
function issueLinkLater(
  payload: Payload,
  member: Member,
  next: string | undefined,
  newAccount: boolean,
) {
  after(async () => {
    try {
      await issueLink(payload, member, next, newAccount);
    } catch (error) {
      console.error(`Sign-in link for member ${member.id} failed`, error);
    }
  });
}

/**
 * Emails a sign-in link when the address has an active account. Callers show
 * the same message either way, so the form never reveals who has an account.
 */
export async function sendSignInLink(email: string, next?: string) {
  // Fail for everyone alike when sending is not set up, before any lookup.
  mailSettings();
  const payload = await getCalendarPayload();
  const member = await findMember(payload, email);
  if (!member || member.status !== "active" || recentlySent(member)) return;
  issueLinkLater(payload, member, next, !member.emailVerifiedAt);
}

function profileData(values: ProfileValues) {
  return {
    fullName: values.fullName,
    phone: values.phone,
    organisation: values.organisation || null,
    role: values.role || null,
    industry: (values.industry || null) as Member["industry"],
    city: values.city ? Number(values.city) : null,
    country: values.country || null,
    describes: (values.describes || null) as Member["describes"],
    marketingConsent: values.marketingConsent,
  };
}

/**
 * Creates the account and emails a link that confirms the address and signs in.
 * A confirmed address gets a normal sign-in link and keeps its details, so no
 * one can overwrite another person's profile by signing up with their email.
 */
export async function registerMember(values: CreateAccountValues) {
  mailSettings();
  const payload = await getCalendarPayload();
  const now = new Date().toISOString();
  const existing = await findMember(payload, values.email);
  if (existing) {
    if (existing.emailVerifiedAt || existing.status !== "active")
      return sendSignInLink(values.email, values.next);
    if (recentlySent(existing)) return;
    // Never confirmed: the latest sign-up's details replace the earlier ones.
    const member = await payload.update({
      collection: "members",
      id: existing.id,
      ...trusted,
      data: {
        ...profileData(values),
        termsAcceptedAt: now,
        marketingConsentAt: values.marketingConsent ? now : null,
      },
    });
    return issueLinkLater(payload, member, values.next, true);
  }
  let member: Member;
  try {
    member = await payload.create({
      collection: "members",
      ...trusted,
      data: {
        email: values.email,
        status: "active",
        ...profileData(values),
        termsAcceptedAt: now,
        marketingConsentAt: values.marketingConsent ? now : null,
      },
    });
  } catch (error) {
    // A simultaneous sign-up for the same address hit the unique email index.
    if (await findMember(payload, values.email))
      return sendSignInLink(values.email, values.next);
    throw error;
  }
  issueLinkLater(payload, member, values.next, true);
}

async function findByToken(payload: Payload, token: string) {
  if (!token || token.length > 128) return null;
  const result = await payload.find({
    collection: "members",
    where: {
      and: [
        { loginTokenHash: { equals: hashToken(token) } },
        { loginTokenExpiresAt: { greater_than: new Date().toISOString() } },
        { status: { equals: "active" } },
      ],
    },
    limit: 1,
    ...trusted,
  });
  return result.docs[0] ?? null;
}

/** The address a link signs in, without using the link up. For the Continue page. */
export async function signInLinkEmail(token: string) {
  const payload = await getCalendarPayload();
  return (await findByToken(payload, token))?.email ?? null;
}

/** Uses up a sign-in link. Returns the member, or null if it is invalid, used or expired. */
export async function redeemSignInLink(token: string) {
  const payload = await getCalendarPayload();
  const member = await findByToken(payload, token);
  if (!member) return null;
  const now = new Date().toISOString();
  return payload.update({
    collection: "members",
    id: member.id,
    ...trusted,
    data: {
      loginTokenHash: null,
      loginTokenExpiresAt: null,
      emailVerifiedAt: member.emailVerifiedAt ?? now,
      lastSignInAt: now,
    },
  });
}

export async function updateMemberProfile(
  member: Member,
  values: ProfileValues,
) {
  const payload = await getCalendarPayload();
  const consentChanged = values.marketingConsent !== member.marketingConsent;
  return payload.update({
    collection: "members",
    id: member.id,
    ...trusted,
    data: {
      ...profileData(values),
      ...(consentChanged
        ? {
            marketingConsentAt: values.marketingConsent
              ? new Date().toISOString()
              : null,
          }
        : {}),
    },
  });
}

/** Ends every session for this member, on every device. */
export async function revokeMemberSessions(member: Member) {
  const payload = await getCalendarPayload();
  await payload.update({
    collection: "members",
    id: member.id,
    ...trusted,
    data: { sessionVersion: (member.sessionVersion ?? 0) + 1 },
  });
}
