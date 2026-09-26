import { EVENTS_LAYOUT_KEY, FILTER_KEYS } from "@/constants/filters";
import {
  formatDay,
  getListQuery,
  shiftDate,
  type EventSearchParams,
} from "@/lib/events/event-list";
import { monthRange } from "@/lib/events/event-month";

export type CalendarView = "list" | "week" | "month";

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

export function calendarDateParams(view: CalendarView, date: string) {
  const range = view === "month" ? monthRange(date) : weekRange(date);
  return {
    [EVENTS_LAYOUT_KEY]: view,
    [FILTER_KEYS.date]: view === "list" ? date : undefined,
    [FILTER_KEYS.dateFrom]: view !== "list" ? range.from : undefined,
    [FILTER_KEYS.dateTo]: view !== "list" ? range.to : undefined,
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
