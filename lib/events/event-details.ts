import { externalUrl, formatTime } from "@/lib/events/event-list";
import {
  ACCESS_OPTIONS,
  EVENT_TYPES,
  INDUSTRIES,
  PRIVATE_ACCESS,
} from "@/payload/constants";
import type { PublicEvent } from "@/requests/helpers/types";

export const isPrivateEvent = (event: PublicEvent) =>
  PRIVATE_ACCESS.includes(event.access);

export const industryLabel = (event: PublicEvent) =>
  INDUSTRIES.find((item) => item.value === event.industry)?.label ??
  event.industry;

export const categoryLabel = (event: PublicEvent) =>
  [
    EVENT_TYPES.find((item) => item.value === event.eventType)?.label,
    industryLabel(event),
  ]
    .filter(Boolean)
    .join(" · ");

export function accessLabel(event: PublicEvent) {
  if (event.access === "invitation-only") return "Private · Invitation only";
  return (
    ACCESS_OPTIONS.find((item) => item.value === event.access)?.label ??
    event.access
  );
}

/** "9:00 AM to 5:00 PM WAT", or "All day". */
export function timeRange(
  event: PublicEvent,
  timezone: string,
  withZone = true,
) {
  if (event.allDay) return "All day";
  const _zone =
    withZone &&
    (event.city?.timezoneLabel ||
      new Intl.DateTimeFormat("en", {
        timeZone: timezone,
        timeZoneName: "short",
      })
        .formatToParts(new Date(event.startAt))
        .find((part) => part.type === "timeZoneName")?.value);
  const times = [event.startAt, event.endAt]
    .filter((instant): instant is string => Boolean(instant))
    .map((instant) => formatTime(instant, timezone))
    .join(" to ");
  return [times].filter(Boolean).join(" ");
}

export const statusLabel = (event: PublicEvent) =>
  event.status === "cancelled"
    ? "Cancelled"
    : event.status === "postponed"
      ? "Postponed · New date to be confirmed"
      : null;

/** The organiser's map link when it is a Google Maps link, else a search. */
export function venueMapUrl(event: PublicEvent) {
  const venue = event.venue;
  if (!venue) return undefined;
  const saved = externalUrl(venue.mapUrl);
  const url = saved ? new URL(saved) : undefined;
  if (
    url &&
    [
      "www.google.com",
      "google.com",
      "maps.google.com",
      "maps.app.goo.gl",
      "goo.gl",
    ].includes(url.hostname)
  )
    return url.href;
  const address = [venue.name, venue.address, venue.area, event.city?.name]
    .filter(Boolean)
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/** live.ft.com from https://live.ft.com/, for display only. */
export function displayDomain(value?: string | null) {
  const href = externalUrl(value);
  return href ? new URL(href).host.replace(/^www\./, "") : undefined;
}
