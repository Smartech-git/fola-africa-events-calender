import { cityDate, shiftDate } from "@/lib/events/event-list";
import type { PublicEvent } from "@/requests/events/get-events-by-city";

const utcStamp = (value: string | Date) =>
  new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
const escapeText = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n|\r/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

function foldLine(line: string) {
  const encoder = new TextEncoder();
  let folded = "";
  let width = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (width + size > 75) {
      folded += "\r\n ";
      width = 1;
    }
    folded += character;
    width += size;
  }
  return folded;
}

function calendarDates(event: PublicEvent, timezone: string) {
  if (!event.allDay)
    return {
      start: utcStamp(event.startAt),
      end: event.endAt ? utcStamp(event.endAt) : undefined,
    };
  const start = cityDate(event.startAt, timezone);
  const lastDay =
    event.endAt && Date.parse(event.endAt) > Date.parse(event.startAt)
      ? cityDate(new Date(Date.parse(event.endAt) - 1), timezone)
      : start;
  return {
    start: start.replaceAll("-", ""),
    end: shiftDate(lastDay, 1).replaceAll("-", ""),
  };
}

function calendarTitle(event: PublicEvent) {
  if (event.status === "cancelled") return `Cancelled: ${event.title}`;
  if (event.status === "postponed") return `Postponed: ${event.title}`;
  return event.title;
}

function location(event: PublicEvent) {
  return [event.venue?.name, event.venue?.address ?? event.venue?.area]
    .filter(Boolean)
    .join(", ");
}

function description(event: PublicEvent, url: string) {
  return [
    event.status === "postponed"
      ? "Postponed. New date to be confirmed."
      : undefined,
    event.status === "cancelled" ? "This event has been cancelled." : undefined,
    event.description,
    url,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function createEventCalendar(
  event: PublicEvent,
  timezone: string,
  url: string,
  now = new Date(),
) {
  const dates = calendarDates(event, timezone);
  const dateType = event.allDay ? ";VALUE=DATE" : "";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FOLA//Events Calendar//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@${new URL(url).hostname}`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART${dateType}:${dates.start}`,
    ...(dates.end ? [`DTEND${dateType}:${dates.end}`] : []),
    `SUMMARY:${escapeText(calendarTitle(event))}`,
    `DESCRIPTION:${escapeText(description(event, url))}`,
    ...(location(event) ? [`LOCATION:${escapeText(location(event))}`] : []),
    `URL:${url.replace(/[\r\n]/g, "")}`,
    `STATUS:${event.status === "cancelled" ? "CANCELLED" : event.status === "postponed" ? "TENTATIVE" : "CONFIRMED"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function googleCalendarUrl(
  event: PublicEvent,
  timezone: string,
  url: string,
) {
  const dates = calendarDates(event, timezone);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: calendarTitle(event),
    dates: `${dates.start}/${dates.end ?? dates.start}`,
    ctz: timezone,
    details: description(event, url),
  });
  if (location(event)) params.set("location", location(event));
  return `https://calendar.google.com/calendar/render?${params}`;
}
