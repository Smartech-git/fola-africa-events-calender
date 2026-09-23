import { request } from "@/lib/api/request";
import type { ErrorResponse } from "@/requests/helpers/types";

export interface CalendarPage<T> {
  data: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  nextPage: number | null;
}

export async function requestCalendarPage<T>(
  endpoint: string,
  params: URLSearchParams,
): Promise<CalendarPage<T>> {
  const separator = endpoint.includes("?") ? "&" : "?";
  const response = await request<CalendarPage<T> & ErrorResponse>({
    endpoint: endpoint + separator + params.toString(),
    options: { method: "GET" },
  });

  console.log(response, endpoint + separator + params.toString());
  
  if (response && "success" in response) {
    throw new Error(
      typeof response.message === "string"
        ? response.message
        : `Calendar request failed${response.status ? ` (HTTP ${response.status})` : ""}.`,
    );
  }
  if (response?.errors?.length)
    throw new Error(response.errors.map((error) => error.message).join("; "));
  const page = response;
  if (!page || !Array.isArray(page.data))
    throw new Error("Calendar response did not contain data.");
  return page;
}
