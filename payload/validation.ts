import type { FieldHook } from "payload";

import {
  LINK_REQUIRED_ACCESS,
  LINKED_ACCESS,
  PUBLIC_STATUSES,
} from "@/payload/constants";

/**
 * Approving or publishing a public submission needs a decision for each
 * submitted organiser or venue. Saving it before approval does not.
 */
export const approvalDecision =
  (relation: "organiser" | "venue") =>
  (
    value: unknown,
    { data }: { data: Record<string, unknown> | undefined },
  ): true | string => {
    const submitted = data?.[
      relation === "organiser" ? "submittedOrganiser" : "submittedVenue"
    ] as { name?: string | null } | undefined;
    const status = String(data?.status ?? "");
    if (
      value ||
      data?.source !== "submission" ||
      !submitted?.name ||
      !["approved", ...PUBLIC_STATUSES].includes(status)
    )
      return true;
    return `Choose a ${relation} decision before approval.`;
  };

export function httpURL(value: unknown): true | string {
  if (!value || webURL(value)) return true;
  return "Enter a web address such as example.com or https://example.com, without embedded credentials.";
}

/**
 * Turn a web address into an HTTP(S) URL, assuming HTTPS when the scheme is
 * left out (example.com becomes https://example.com). Undefined when invalid.
 */
export function webURL(value: unknown): string | undefined {
  const input = String(value ?? "").trim();
  if (!input) return undefined;
  // A scheme has no dots, so example.com:8080 still counts as a bare domain.
  const hasScheme = /^[a-z][a-z\d+-]*:/i.test(input);
  const candidate = hasScheme ? input : `https://${input.replace(/^\/+/, "")}`;
  try {
    const url = new URL(candidate);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      // Bare input needs a real domain, so a stray word is not a link.
      (!hasScheme && !/\.[a-z]{2,}$/i.test(url.hostname))
    )
      return undefined;
    return candidate;
  } catch {
    return undefined;
  }
}

/** Field hook: store bare domains typed in the admin as HTTPS URLs. */
export const normalizeWebURL: FieldHook = ({ value }) =>
  typeof value === "string" && value.trim() ? (webURL(value) ?? value) : value;

const EMAIL = /^[^\s@<>()[\]\\,;:"?]+@[^\s@<>()[\]\\,;:"?]+\.[a-z]{2,}$/i;

/**
 * Turn an action link into a URL: an email address (with or without mailto:)
 * becomes a mailto: link, anything else goes through webURL. Undefined when
 * invalid.
 */
export function actionURL(value: unknown): string | undefined {
  const input = String(value ?? "").trim();
  const email = input.replace(/^mailto:/i, "");
  if (EMAIL.test(email)) return `mailto:${email}`;
  return webURL(input);
}

export function actionLink(value: unknown): true | string {
  if (!value || actionURL(value)) return true;
  return "Enter a web address such as example.com, or an email address such as tickets@example.com.";
}

/** Field hook: store emails as mailto: links and bare domains as HTTPS URLs. */
export const normalizeActionURL: FieldHook = ({ value }) =>
  typeof value === "string" && value.trim()
    ? (actionURL(value) ?? value)
    : value;

export function shortDescription(value: unknown): true | string {
  return !value || String(value).trim().split(/\s+/u).length <= 60
    ? true
    : "Descriptions must contain no more than 60 words.";
}

/** Turn an Instagram handle or profile link into a canonical profile URL. */
export function instagramProfile(value: unknown): string | undefined {
  const input = String(value ?? "").trim();
  if (!input) return undefined;
  const handle = /^@?([A-Za-z0-9._]{1,30})$/.exec(input)?.[1];
  if (handle) return `https://www.instagram.com/${handle}`;
  try {
    // Accept pasted links with or without the scheme, e.g. instagram.com/name.
    const url = new URL(
      /^https?:\/\//i.test(input) ? input : `https://${input}`,
    );
    const name = /^\/([A-Za-z0-9._]{1,30})\/?$/.exec(url.pathname)?.[1];
    if (
      ["instagram.com", "www.instagram.com", "m.instagram.com"].includes(
        url.hostname.toLowerCase(),
      ) &&
      name
    )
      return `https://www.instagram.com/${name}`;
  } catch {}
  return undefined;
}

export function instagramURL(value: unknown): true | string {
  return !value || instagramProfile(value) === value
    ? true
    : "Use an Instagram profile link such as https://www.instagram.com/name.";
}

export function relationID(value: unknown): string | number | undefined {
  if (typeof value === "number" || typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value)
    return relationID(value.id);
}

export function eventProblems(event: Record<string, any>): string[] {
  const errors: string[] = [];
  const start = Date.parse(event.startAt);
  if (!Number.isFinite(start))
    errors.push("A valid start date and time is required.");
  if (
    event.endAt &&
    (!Number.isFinite(Date.parse(event.endAt)) ||
      Date.parse(event.endAt) <= start)
  )
    errors.push("End time must be later than start time.");
  if (LINK_REQUIRED_ACCESS.includes(event.access) && !event.actionUrl)
    errors.push("Tickets and RSVP require an action URL.");
  if (!LINKED_ACCESS.includes(event.access) && event.actionUrl)
    errors.push(
      "Invitation only and Private listings cannot have an action URL.",
    );
  if (event.visibility === "held-date" && event.access !== "private")
    errors.push("Held dates must use Private access.");
  if (event.secondaryIndustry && event.secondaryIndustry === event.industry)
    errors.push("Secondary industry must differ from the primary industry.");
  const urlResult = actionLink(event.actionUrl);
  if (urlResult !== true) errors.push(urlResult);
  const descriptionResult = shortDescription(event.description);
  if (descriptionResult !== true) errors.push(descriptionResult);
  return errors;
}
