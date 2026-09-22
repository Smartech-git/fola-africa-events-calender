import { request } from "@/lib/api/request";
import type { ErrorResponse } from "@/requests/helpers/types";
import type { City, Season } from "@/types/payload-types";

export type SeasonSummary = Pick<
  Season,
  "id" | "name" | "slug" | "startDate" | "endDate" | "description" | "status"
>;
export interface EventsHeader {
  city: Pick<City, "name" | "timezone" | "timezoneLabel">;
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
  const separator = endpoint.includes("?") ? "&" : "?";
  const response = await request<EventsHeader & ErrorResponse>({
    endpoint: `${endpoint}${separator}${params}`,
    options: { method: "GET", fetchOptions: { cache: "no-store" } },
  });
  if (response && "success" in response) {
    throw new Error(
      typeof response.message === "string"
        ? response.message
        : `Events header request failed${response.status ? ` (HTTP ${response.status})` : ""}.`,
    );
  }
  if (response?.errors?.length)
    throw new Error(response.errors.map((error) => error.message).join("; "));
  if (!response?.city || !Array.isArray(response.seasons))
    throw new Error(
      "Events header response did not contain city and season data.",
    );
  return response;
}
