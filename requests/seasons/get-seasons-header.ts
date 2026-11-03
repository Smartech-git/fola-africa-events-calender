import "server-only";

import type { City } from "@/payload-types";
import { requestCalendarData } from "@/requests/helpers/calendar-request";
import type { CalendarCity, SeasonSummary } from "@/requests/helpers/types";

export interface SeasonsHeader {
  city: CalendarCity & Pick<City, "id" | "slug">;
  season: SeasonSummary;
}

export interface GetSeasonsHeaderProps {
  slug: string;
  endpoint?: string;
}

export async function getSeasonsHeader({
  slug,
  endpoint = "/api/public/seasons/header",
}: GetSeasonsHeaderProps): Promise<SeasonsHeader> {
  const response = await requestCalendarData<SeasonsHeader>(
    endpoint,
    new URLSearchParams({ slug }),
  );
  if (!response.city?.slug || !response.season?.slug)
    throw new Error(
      "Seasons header response did not contain city and season data.",
    );
  return response;
}
