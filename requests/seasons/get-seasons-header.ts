import "server-only";

import { notFound } from "next/navigation";

import {
  CalendarRequestError,
  requestCalendarData,
} from "@/requests/helpers/calendar-request";
import type { CalendarCity, SeasonSummary } from "@/requests/helpers/types";
import type { City } from "@/types/payload-types";

export interface SeasonsHeader {
  city: CalendarCity & Pick<City, "id" | "slug">;
  season: SeasonSummary;
}

export interface GetSeasonsHeaderOptions {
  slug: string;
  endpoint?: string;
}

const requestSeasonsHeader = async (slug: string, endpoint: string) => {
  let response: SeasonsHeader;
  try {
    response = await requestCalendarData<SeasonsHeader>(
      endpoint,
      new URLSearchParams({ slug }),
    );
  } catch (error) {
    if (error instanceof CalendarRequestError && error.status === 404)
      notFound();
    throw error;
  }
  if (!response.city?.slug || !response.season?.slug)
    throw new Error(
      "Seasons header response did not contain city and season data.",
    );
  return response;
};

export async function getSeasonsHeader({
  slug,
  endpoint = "/api/public/seasons/header",
}: GetSeasonsHeaderOptions): Promise<SeasonsHeader> {
  return requestSeasonsHeader(slug, endpoint);
}
