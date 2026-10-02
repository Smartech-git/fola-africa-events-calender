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

export interface GetEventsBySeasonsOptions
  extends RequestOptions, EventFilterOptions {
  /** Published season slug. */
  seasons: string;
}

export async function getEventsBySeasons({
  endpoint = "/api/public/seasons/events",
  seasons,
  ...options
}: GetEventsBySeasonsOptions): Promise<Events> {
  return requestCalendarPage<PublicEvent>(
    endpoint,
    eventQueryParams({ seasons }, options),
  );
}
