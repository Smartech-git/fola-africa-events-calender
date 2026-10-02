import {
  eventQueryParams,
  requestCalendarPage,
} from "@/requests/helpers/calendar-request";
import type {
  EventFilterOptions,
  Events,
  PublicEvent,
  RequestOptions,
} from "@/requests/helpers/types";
import type { City } from "@/types/payload-types";

export type { Events, PublicEvent } from "@/requests/helpers/types";

export interface GetEventsByCityOptions
  extends RequestOptions, EventFilterOptions {
  /** City slug or numeric Payload ID. */
  city: City["id"] | string;
}

export async function getEventsByCity({
  endpoint = "/api/public/events",
  city,
  ...options
}: GetEventsByCityOptions): Promise<Events> {
  const params = eventQueryParams({ city }, options);
  return requestCalendarPage<PublicEvent>(endpoint, params);
}
