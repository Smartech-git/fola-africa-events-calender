import { type CalendarPage, requestCalendarPage } from "@/requests/events/helpers";
import type { RequestOptions } from "@/requests/helpers/types";
import type { City, Season } from "@/types/payload-types";


export type SeasonSummary = Pick<
  Season,
  "id" | "name" | "slug" | "startDate" | "endDate" | "description" | "status"
>;
export type Seasons = CalendarPage<SeasonSummary>;

export interface GetSeasonsByCityOptions extends RequestOptions {
  /** City slug or numeric Payload ID. */
  city: City["id"] | string;
}

export async function getSeasonsByCity({
  endpoint = "/api/public/seasons",
  city,
  page = 1,
  limit = 100,
}: GetSeasonsByCityOptions): Promise<Seasons> {
  return requestCalendarPage<SeasonSummary>(
    endpoint,
    new URLSearchParams({
      city: String(city),
      page: String(page),
      limit: String(limit),
    }),
  );
}
