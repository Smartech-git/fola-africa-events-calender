import { requestCalendarPage } from "@/requests/helpers/calendar-request";
import type {
  CalendarPage,
  RequestOptions,
  SeasonSummary,
} from "@/requests/helpers/types";
import type { City } from "@/types/payload-types";

/** A season with the city it belongs to, for "In the diary". */
export interface UpcomingSeason extends SeasonSummary {
  city: Pick<City, "name" | "slug" | "timezone"> | null;
}

export type UpcomingSeasons = CalendarPage<UpcomingSeason>;

/** Seasons that have not ended yet, across all cities, soonest first. */
export async function getUpcomingSeasons({
  endpoint = "/api/public/seasons/upcoming",
  page = 1,
  limit = 10,
}: RequestOptions = {}): Promise<UpcomingSeasons> {
  return requestCalendarPage<UpcomingSeason>(
    endpoint,
    new URLSearchParams({ page: String(page), limit: String(limit) }),
  );
}
