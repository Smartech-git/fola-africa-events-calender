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
  if (["tickets", "rsvp"].includes(event.access) && !event.actionUrl)
    errors.push("Tickets and RSVP require an action URL.");
  if (["invitation-only", "private"].includes(event.access) && event.actionUrl)
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
