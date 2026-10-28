import { FILTER_KEYS } from "@/constants/filters";
import {
  formatDay,
  getListQuery,
  shiftDate,
  type EventSearchParams,
} from "@/lib/events/event-list";
import { monthRange } from "@/lib/events/event-month";

export type CalendarView = "list" | "day" | "week" | "month";

export function weekRange(date: string) {
  const from = shiftDate(date, -new Date(`${date}T12:00:00Z`).getUTCDay());
  return { from, to: shiftDate(from, 6) };
}

export function getWeekQuery(
  params: EventSearchParams,
  city: string,
  today: string,
) {
  const query = getListQuery(params, city);
  const range = weekRange(query.range.from ?? query.range.to ?? today);
  return {
    filters: {
      ...query.filters,
      date: undefined,
      dateFrom: range.from,
      dateTo: range.to,
    },
    range,
  };
}

/** A single date opens the day view; week and month cover their range. */
export function calendarDateParams(view: CalendarView, date: string) {
  const single = view === "list" || view === "day";
  const range = view === "month" ? monthRange(date) : weekRange(date);
  return {
    [FILTER_KEYS.eventLayoutKey]: single ? "day" : view,
    [FILTER_KEYS.date]: single ? date : undefined,
    [FILTER_KEYS.dateFrom]: single ? undefined : range.from,
    [FILTER_KEYS.dateTo]: single ? undefined : range.to,
    [FILTER_KEYS.page]: undefined,
  };
}

export function weekHeading(from: string, to: string) {
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  return {
    title: `${formatDay(from, sameMonth ? "dd" : "dd MMMM")}\u2013${formatDay(to, "dd MMMM")}`,
    year: sameYear
      ? from.slice(0, 4)
      : `${from.slice(0, 4)}\u2013${to.slice(0, 4)}`,
  };
}
