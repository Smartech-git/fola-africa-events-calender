import { request } from "@/lib/api/request";
import type {
  CalendarPage,
  ErrorResponse,
  EventFilterOptions,
  RequestOptions,
} from "@/requests/helpers/types";

export class CalendarRequestError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

export async function requestCalendarData<T>(
  endpoint: string,
  params: URLSearchParams,
): Promise<T> {
  const separator = endpoint.includes("?") ? "&" : "?";
  const response = await request<T & ErrorResponse>({
    endpoint: `${endpoint}${separator}${params}`,
    options: { method: "GET", fetchOptions: { cache: "no-store" } },
  });
  if (response && "success" in response) {
    const details = response.message as ErrorResponse | null;
    throw new CalendarRequestError(
      typeof response.message === "string"
        ? response.message
        : details?.errors?.map((error) => error.message).join("; ") ||
            "Calendar request failed.",
      response.status,
    );
  }
  if (response?.errors?.length)
    throw new CalendarRequestError(
      response.errors.map((error) => error.message).join("; "),
    );
  if (!response) throw new CalendarRequestError("Calendar response was empty.");
  return response;
}

export async function requestCalendarPage<T>(
  endpoint: string,
  params: URLSearchParams,
): Promise<CalendarPage<T>> {
  const page = await requestCalendarData<CalendarPage<T>>(endpoint, params);
  if (!Array.isArray(page.data))
    throw new CalendarRequestError("Calendar response did not contain data.");
  return page;
}

export function eventQueryParams(
  scope: { city: string | number } | { seasons: string },
  {
    industry,
    access,
    date,
    dateFrom,
    dateTo,
    page = 1,
    limit = 100,
  }: EventFilterOptions & RequestOptions,
) {
  const params = new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(scope).map(([key, value]) => [key, String(value)]),
    ),
    page: String(page),
    limit: String(limit),
  });
  for (const [key, value] of Object.entries({ industry, access })) {
    for (const item of Array.isArray(value) ? value : value ? [value] : [])
      params.append(key, item);
  }
  for (const [key, value] of Object.entries({ date, dateFrom, dateTo }))
    if (value !== undefined) params.set(key, value);
  return params;
}
