import { requestCalendarData } from "@/requests/helpers/calendar-request";
import type { CalendarCity, SeasonSummary } from "@/requests/helpers/types";
import type { City } from "@/types/payload-types";

export type { SeasonSummary } from "@/requests/helpers/types";
export interface EventsHeader {
  city: CalendarCity;
  seasons: SeasonSummary[];
}

export interface GetEventsHeaderOptions {
  endpoint?: string;
  /** City slug or numeric Payload ID. */
  city: City["id"] | string;
}

export async function getEventsHeader({
  endpoint = "/api/public/events/header",
  city,
}: GetEventsHeaderOptions): Promise<EventsHeader> {
  const params = new URLSearchParams({ city: String(city) });
  const response = await requestCalendarData<EventsHeader>(endpoint, params);
  if (!response?.city || !Array.isArray(response.seasons))
    throw new Error(
      "Events header response did not contain city and season data.",
    );
  return response;
}
