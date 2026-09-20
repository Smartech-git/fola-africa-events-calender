import type { toPublicEvent } from "@/payload/public-event";
import {
  type CalendarPage,
  requestCalendarPage,
} from "@/requests/events/helpers";
import type { RequestOptions } from "@/requests/helpers/types";
import type { City, Event } from "@/types/payload-types";

export type PublicEvent = NonNullable<ReturnType<typeof toPublicEvent>>;
export type Events = CalendarPage<PublicEvent>;

export interface GetEventsByCityOptions extends RequestOptions {
  /** City slug or numeric Payload ID. */
  city: City["id"] | string;
  industry?: Event["industry"] | Event["industry"][];
  access?: Event["access"] | Event["access"][];
  /** A single YYYY-MM-DD date in the city's timezone. */
  date?: string;
  /** Inclusive local calendar dates; cannot be combined with date. */
  dateFrom?: string;
  dateTo?: string;
}

export async function getEventsByCity({
  endpoint = "/api/public/events",
  city,
  industry,
  access,
  date,
  dateFrom,
  dateTo,
  page = 1,
  limit = 100,
}: GetEventsByCityOptions): Promise<Events> {
  const params = new URLSearchParams({
    city: String(city),
    page: String(page),
    limit: String(limit),
  });
  for (const [key, value] of Object.entries({ industry, access })) {
    for (const item of Array.isArray(value) ? value : value ? [value] : [])
      params.append(key, item);
  }
  for (const [key, value] of Object.entries({ date, dateFrom, dateTo }))
    if (value !== undefined) params.set(key, value);
  return requestCalendarPage<PublicEvent>(endpoint, params);
}
