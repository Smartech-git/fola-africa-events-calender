import { LINK_REQUIRED_ACCESS, LINKED_ACCESS } from "@/payload/constants";

export function httpURL(value: unknown): true | string {
  if (!value) return true;
  try {
    const url = new URL(String(value));
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? true
      : "Use an HTTP or HTTPS URL without embedded credentials.";
  } catch {
    return "Enter a valid HTTP or HTTPS URL.";
  }
}

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
  const urlResult = httpURL(event.actionUrl);
  if (urlResult !== true) errors.push(urlResult);
  const descriptionResult = shortDescription(event.description);
  if (descriptionResult !== true) errors.push(descriptionResult);
  return errors;
}
