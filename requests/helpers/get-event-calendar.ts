import "server-only";

import { FILTER_KEYS } from "@/constants/filters";
import {
  cityDate,
  getListQuery,
  shiftDate,
  type EventSearchParams,
} from "@/lib/events/event-list";
import { getMonthQuery } from "@/lib/events/event-month";
import { getWeekQuery } from "@/lib/events/event-week";
import { getEventList } from "@/requests/events/get-event-list";
import type { PublicEvent, SeasonSummary } from "@/requests/helpers/types";

export async function getEventCalendar({
  city,
  timezone,
  filters,
  season,
}: {
  city: string;
  timezone: string;
  filters: EventSearchParams;
  season?: SeasonSummary;
}) {
  const today = cityDate(new Date(), timezone);
  const viewParam = filters[FILTER_KEYS.eventLayoutKey];
  const view = Array.isArray(viewParam) ? viewParam[0] : viewParam;
  const isWeek = view === "week";
  const isMonth = view === "month";
  const isDay = view === "day";
  const seasonFrom = season?.startDate
    ? cityDate(season.startDate, timezone)
    : undefined;
  const seasonTo = season?.endDate
    ? cityDate(season.endDate, timezone)
    : undefined;
  const anchor =
    seasonFrom && today < seasonFrom
      ? seasonFrom
      : seasonTo && today > seasonTo
        ? seasonTo
        : today;
  const defaultDateFrom =
    !isWeek && !isMonth ? (seasonFrom ?? shiftDate(today, -2)) : undefined;
  const defaultDateTo = !isWeek && !isMonth ? seasonTo : undefined;
  const scope = <T extends ReturnType<typeof getListQuery>>(query: T) => ({
    ...query,
    filters: { ...query.filters, seasons: season?.slug },
  });
  let query = scope(getListQuery({}, city, defaultDateFrom, defaultDateTo));
  let weekQuery = scope(getWeekQuery({}, city, anchor));
  let monthQuery = scope(getMonthQuery({}, city, anchor));
  let initialError: string | undefined;
  let invalidFilters = false;
  let events: PublicEvent[] = [];
  try {
    if (isMonth) {
      monthQuery = scope(getMonthQuery(filters, city, anchor));
      query = monthQuery;
    } else if (isWeek) {
      weekQuery = scope(getWeekQuery(filters, city, anchor));
      query = weekQuery;
    } else if (isDay) {
      // The day view shows one date, today unless another is chosen.
      const date = filters[FILTER_KEYS.date];
      query = scope(
        getListQuery(
          {
            ...filters,
            [FILTER_KEYS.date]:
              (Array.isArray(date) ? date[0] : date) ?? anchor,
            [FILTER_KEYS.dateFrom]: undefined,
            [FILTER_KEYS.dateTo]: undefined,
          },
          city,
        ),
      );
    } else {
      query = scope(
        getListQuery(filters, city, defaultDateFrom, defaultDateTo),
      );
    }
  } catch (error) {
    invalidFilters = true;
    initialError =
      error instanceof Error
        ? error.message
        : "Choose valid filters and try again.";
  }
  if (!invalidFilters) {
    try {
      events = await getEventList(query.filters);
    } catch {
      initialError = "We couldn't load the calendar. Please try again.";
    }
  }
  return {
    today,
    isWeek,
    isMonth,
    isDay,
    defaultDateFrom,
    defaultDateTo,
    query,
    weekQuery,
    monthQuery,
    events,
    initialError,
    invalidFilters,
  };
}
