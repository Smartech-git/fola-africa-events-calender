import { DEFAULT_CITY_TIMEZONE } from "@/constants/nav";
import { cityDate } from "@/lib/events/event-list";
import type { PublicEvent } from "@/requests/helpers/types";

export type Tense = "past" | "today" | "future";

/** Where a city date (YYYY-MM-DD) sits against the city's today. */
export function dateTense(date: string, today: string): Tense {
  return date < today ? "past" : date === today ? "today" : "future";
}

/** Today's date in the city, as YYYY-MM-DD. */
export function cityToday(timezone: string) {
  return cityDate(new Date(), timezone);
}

/**
 * True once a happening is over: past its end time, or, when it is all day
 * or has no end time, once its last day has gone by in the city.
 */
export function hasEnded(
  event: Pick<PublicEvent, "startAt" | "endAt" | "allDay" | "city">,
) {
  const timezone = event.city?.timezone ?? DEFAULT_CITY_TIMEZONE;
  const last = event.endAt ?? event.startAt;
  if (event.allDay || !event.endAt)
    return cityDate(last, timezone) < cityToday(timezone);
  return new Date(last).getTime() < Date.now();
}
