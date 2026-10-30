import type { Payload, Where } from "payload";

import { INDUSTRIES, MEMBER_TYPES } from "@/payload/constants";
import type { Member } from "@/payload-types";

export const BREVO_QUEUE = "brevo-sync";
export const BREVO_RETRIES = 5;
const API = "https://api.brevo.com/v3";

/** Only members who can be emailed: active, and agreed to marketing. */
export const brevoAudience: Where = {
  and: [
    { status: { equals: "active" } },
    { marketingConsent: { equals: true } },
  ],
};

export const isBrevoAudience = (
  member: Pick<Member, "status" | "marketingConsent">,
) => member.status === "active" && Boolean(member.marketingConsent);

/**
 * Contact attributes Happenings sends. EMAIL, FIRSTNAME and LASTNAME are
 * Brevo's own; `npm run brevo:setup` creates the rest. Phone numbers stay out:
 * consent covers email updates only.
 */
export const BREVO_ATTRIBUTES = [
  { name: "FIRSTNAME", type: "text", builtIn: true },
  { name: "LASTNAME", type: "text", builtIn: true },
  { name: "ORGANISATION", type: "text" },
  { name: "JOB_TITLE", type: "text" },
  { name: "INDUSTRY", type: "text" },
  { name: "CITY", type: "text" },
  { name: "COUNTRY", type: "text" },
  { name: "MEMBER_TYPE", type: "text" },
  { name: "OPT_IN_DATE", type: "date" },
] as const;

export type BrevoAttributes = Record<
  (typeof BREVO_ATTRIBUTES)[number]["name"],
  string
>;

const labelOf = (
  options: { label: string; value: string }[],
  value?: string | null,
) => options.find((option) => option.value === value)?.label ?? "";

/** The member as Brevo sees them. Load the member with its city populated. */
export function brevoAttributes(member: Member): BrevoAttributes {
  const [first = "", ...rest] = member.fullName.trim().split(/\s+/);
  return {
    FIRSTNAME: first,
    LASTNAME: rest.join(" "),
    ORGANISATION: member.organisation ?? "",
    JOB_TITLE: member.role ?? "",
    INDUSTRY: labelOf(INDUSTRIES, member.industry),
    CITY:
      member.city && typeof member.city === "object" ? member.city.name : "",
    COUNTRY: member.country ?? "",
    MEMBER_TYPE: labelOf(MEMBER_TYPES, member.describes),
    OPT_IN_DATE: member.marketingConsentAt?.slice(0, 10) ?? "",
  };
}

export function brevoSettings() {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const listId = Number(process.env.BREVO_LIST_ID);
  if (!apiKey) return null;
  return {
    apiKey,
    listId: Number.isInteger(listId) && listId > 0 ? listId : null,
  };
}

/** Both the key and the list are needed before members can be synced. */
export const brevoConfigured = () => Boolean(brevoSettings()?.listId);

export class BrevoError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

/** One Brevo API call. Resolves with the JSON body, or null for empty replies. */
export async function brevoRequest<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown; allow404?: boolean } = {},
): Promise<T | null> {
  const settings = brevoSettings();
  if (!settings) throw new BrevoError("BREVO_API_KEY is not set.", 0);
  const response = await fetch(`${API}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "api-key": settings.apiKey,
      accept: "application/json",
      ...(init.body ? { "content-type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  if (response.status === 404 && init.allow404) return null;
  const text = await response.text();
  if (!response.ok) {
    let message = text;
    try {
      message = JSON.parse(text).message ?? text;
    } catch {}
    throw new BrevoError(
      `Brevo ${init.method ?? "GET"} ${path} failed (${response.status}): ${message}`,
      response.status,
    );
  }
  return text ? (JSON.parse(text) as T) : null;
}

const contactPath = (email: string) =>
  `/contacts/${encodeURIComponent(email.toLowerCase())}`;

/** Adds or updates the contact and puts them on the Happenings list. */
async function subscribe(member: Member, listId: number) {
  const attributes = Object.fromEntries(
    // Brevo rejects an empty date; leave it unset instead.
    Object.entries(brevoAttributes(member)).filter(
      ([name, value]) => name !== "OPT_IN_DATE" || value,
    ),
  );
  await brevoRequest("/contacts", {
    method: "POST",
    body: {
      email: member.email,
      attributes,
      listIds: [listId],
      updateEnabled: true,
      // They opted in on Happenings, so lift an earlier Brevo unsubscribe.
      emailBlacklisted: false,
    },
  });
}

/** Takes the contact off the Happenings list; their Brevo history stays. */
async function unsubscribe(email: string, listId: number) {
  await brevoRequest(contactPath(email), {
    method: "PUT",
    body: { unlinkListIds: [listId] },
    allow404: true,
  });
}

async function deleteContact(email: string) {
  await brevoRequest(contactPath(email), { method: "DELETE", allow404: true });
}

/**
 * Makes Brevo match the member as they are now, so syncs can run in any order
 * and repeat safely. A deleted member is removed from Brevo entirely.
 */
export async function syncMemberToBrevo(
  payload: Payload,
  {
    memberId,
    email,
    previousEmail,
  }: { memberId: number; email: string; previousEmail?: string | null },
) {
  const settings = brevoSettings();
  if (!settings?.listId) return "not-configured" as const;
  const member = await payload.findByID({
    collection: "members",
    id: memberId,
    depth: 1,
    disableErrors: true,
    overrideAccess: true,
    joins: false,
    populate: { cities: { name: true } },
  });
  // A changed address is a new Brevo contact; the old one goes.
  if (previousEmail && previousEmail !== member?.email)
    await deleteContact(previousEmail);
  if (!member) {
    await deleteContact(email);
    return "deleted" as const;
  }
  if (isBrevoAudience(member)) {
    await subscribe(member, settings.listId);
    return "subscribed" as const;
  }
  await unsubscribe(member.email, settings.listId);
  return "unsubscribed" as const;
}
