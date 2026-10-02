import type { toPublicEvent } from "@/payload/public-event";
import type { City, Event, Season } from "@/types/payload-types";

export type RequestOptions = {
  endpoint?: string;
  page?: number;
  limit?: number;
};

export type ErrorResponse = {
  errors?: { message: string }[];
};

export interface CalendarPage<T> {
  data: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  nextPage: number | null;
}

export type PublicEvent = NonNullable<ReturnType<typeof toPublicEvent>>;
export type Events = CalendarPage<PublicEvent>;

export interface EventFilterOptions {
  industry?: Event["industry"] | Event["industry"][];
  access?: Event["access"] | Event["access"][];
  /** A single YYYY-MM-DD date in the city's timezone. */
  date?: string;
  /** Inclusive local calendar dates; cannot be combined with date. */
  dateFrom?: string;
  dateTo?: string;
}

export type SeasonSummary = Pick<
  Season,
  "id" | "name" | "slug" | "startDate" | "endDate" | "description" | "status"
>;
export type CalendarCity = Pick<City, "name" | "timezone" | "timezoneLabel">;
