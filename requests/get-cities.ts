import { requestCalendarPage } from "@/requests/helpers/calendar-request";
import type {
  CalendarPage,
  RequestOptions,
  SeasonSummary,
} from "@/requests/helpers/types";
import type { City } from "@/types/payload-types";

export type CitySummary = Pick<
  City,
  "id" | "name" | "slug" | "country" | "timezone" | "timezoneLabel"
>;

export interface CityOverview extends CitySummary {
  counts: {
    today: number;
    thisWeek: number;
  };
  nextSeason: SeasonSummary | null;
}

export type Cities = CalendarPage<CityOverview>;

export async function getCities({
  endpoint = "/api/public/cities",
  page = 1,
  limit = 100,
}: RequestOptions): Promise<Cities> {
  return requestCalendarPage<CityOverview>(
    endpoint,
    new URLSearchParams({ page: String(page), limit: String(limit) }),
  );
}
