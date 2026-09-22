import { parseDate } from "@internationalized/date";
import { format, parseISO } from "date-fns";

import { EVENTS_LAYOUT_KEY, FILTER_KEYS } from "@/constants/filters";
import { ACCESS_OPTIONS, INDUSTRIES } from "@/payload/constants";
import type {
  GetEventsByCityOptions,
  PublicEvent,
} from "@/requests/events/get-events-by-city";

export type EventListFilters = Pick<
  GetEventsByCityOptions,
  "city" | "industry" | "access" | "date" | "dateFrom" | "dateTo"
>;
export interface DateRange {
  from?: string;
  to?: string;
}
export interface EventDay {
  date: string;
  events: PublicEvent[];
}
export type EventSearchParams = Record<string, string | string[] | undefined>;

export function cityDate(instant: string | Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(instant));
  const part = (type: string) =>
    parts.find((value) => value.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function shiftDate(date: string, days: number) {
  return parseDate(date).add({ days }).toString();
}

export function formatDay(date: string, pattern: string) {
  return format(parseISO(date), pattern);
}

function readDate(value?: string) {
  if (!value) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("Choose a valid date.");
  try {
    return parseDate(value).toString();
  } catch {
    throw new Error("Choose a valid date.");
  }
}

export function  getListQuery(params: EventSearchParams, city: string) {
  const first = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const selected = (key: string, options: { value: string }[]) => {
    const value = params[key];
    const values = (
      Array.isArray(value) ? value : value ? [value] : []
    ).flatMap((item) => item.split(","));
    if (
      values.some((item) => !options.some((option) => option.value === item))
    ) {
      throw new Error(
        "Some filters are invalid. Clear the filters and try again.",
      );
    }
    return [...new Set(values)];
  };
  const date = readDate(first(FILTER_KEYS.date));
  const from = readDate(first(FILTER_KEYS.dateFrom));
  const to = readDate(first(FILTER_KEYS.dateTo));
  if (date && (from || to))
    throw new Error("Choose a single date or a date range, not both.");
  if (from && to && from > to) throw new Error("From must be on or before To.");
  return {
    filters: {
      city,
      date,
      dateFrom: from,
      dateTo: to,
      industry: selected(
        FILTER_KEYS.industry,
        INDUSTRIES,
      ) as EventListFilters["industry"],
      access: selected(
        FILTER_KEYS.access,
        ACCESS_OPTIONS,
      ) as EventListFilters["access"],
    },
    range: { from: date ?? from, to: date ?? to },
  };
}

export function groupEventsByDay(
  events: PublicEvent[],
  timezone: string,
  range: DateRange = {},
): EventDay[] {
  const groups = new Map<string, PublicEvent[]>();
  const unique = [
    ...new Map(events.map((event) => [event.id, event])).values(),
  ];
  unique.sort(
    (a, b) => Date.parse(a.startAt) - Date.parse(b.startAt) || a.id - b.id,
  );
  for (const event of unique) {
    const start = cityDate(event.startAt, timezone);
    // Ends are exclusive: midnight belongs to the preceding day.
    const end =
      event.endAt && Date.parse(event.endAt) > Date.parse(event.startAt)
        ? cityDate(new Date(Date.parse(event.endAt) - 1), timezone)
        : start;
    const last = range.to && range.to < end ? range.to : end;
    for (
      let day = range.from && range.from > start ? range.from : start;
      day <= last;
      day = shiftDate(day, 1)
    ) {
      const entries = groups.get(day) ?? [];
      entries.push(event);
      groups.set(day, entries);
    }
  }
  return [...groups]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, entries]) => ({ date, events: entries }));
}

export function eventTime(event: PublicEvent, timezone: string) {
  if (event.allDay) return "All day";
  const time = (instant: string) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date(instant));
  const start = time(event.startAt);
  if (!event.endAt) return start;
  const end = time(event.endAt);
  const startDate = cityDate(event.startAt, timezone);
  const endDate = cityDate(event.endAt, timezone);
  if (startDate !== endDate) {
    const pattern =
      startDate.slice(0, 4) === endDate.slice(0, 4) ? "dd MMM" : "dd MMM yyyy";
    return `${formatDay(startDate, pattern)} ${start} \u2013 ${formatDay(endDate, pattern)} ${end}`;
  }
  return `${start}\u2013${end}`;
}

export function dayPath(city: string, date: string) {
  const params = new URLSearchParams({
    [EVENTS_LAYOUT_KEY]: "list",
    [FILTER_KEYS.date]: date,
  });
  return `/events/${encodeURIComponent(city)}?${params}`;
}

export function eventAnchor(event: PublicEvent, date: string) {
  return `event-${event.id}-${date}`;
}

export function eventPath(event: PublicEvent, city: string, timezone: string) {
  const date = cityDate(event.startAt, timezone);
  return `${dayPath(city, date)}#${eventAnchor(event, date)}`;
}

export function externalUrl(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
