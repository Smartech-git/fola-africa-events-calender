import {
  ACCESS_OPTIONS,
  EVENT_TYPES,
  INDUSTRIES,
  PUBLIC_STATUSES,
} from "@/payload/constants";
import type { City, Event } from "@/payload-types";

const STATUS_WORDS: Record<string, string> = {
  submitted: "Pending review",
  approved: "Approved · not yet live",
  published: "Live",
  postponed: "Postponed",
  cancelled: "Cancelled",
  withdrawn: "Withdrawn",
  rejected: "Not approved",
};

const label = (
  options: { label: string; value: string }[],
  value?: string | null,
) => options.find((option) => option.value === value)?.label ?? "";

/** Lines about a member's own happening for the edit and result pages. */
export function happeningDisplay(event: Event) {
  const city =
    event.city && typeof event.city === "object" ? (event.city as City) : null;
  const timeZone = city?.timezone ?? "UTC";
  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(event.startAt));
  const full = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(event.allDay
      ? {}
      : { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
  }).format(new Date(event.startAt));
  const organiser =
    event.organiser && typeof event.organiser === "object"
      ? event.organiser.name
      : (event.submittedOrganiser?.name ?? "");
  return {
    statusLine: [STATUS_WORDS[event.status] ?? event.status, day, city?.name]
      .filter(Boolean)
      .join(" · "),
    meta: [
      label(EVENT_TYPES, event.eventType),
      label(INDUSTRIES, event.industry),
      label(ACCESS_OPTIONS, event.access),
    ]
      .filter(Boolean)
      .join(" · "),
    when: [full, city?.name].filter(Boolean).join(" · "),
    publicHref:
      PUBLIC_STATUSES.includes(event.status) && city && event.slug
        ? `/calendar/${encodeURIComponent(city.slug)}/${encodeURIComponent(event.slug)}`
        : undefined,
    organiser,
    city,
  };
}
