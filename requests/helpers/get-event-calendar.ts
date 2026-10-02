import "server-only";

import { EVENTS_LAYOUT_KEY } from "@/constants/filters";
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
  const viewParam = filters[EVENTS_LAYOUT_KEY];
  const view = Array.isArray(viewParam) ? viewParam[0] : viewParam;
  const isWeek = view === "week";
  const isMonth = view === "month";
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
