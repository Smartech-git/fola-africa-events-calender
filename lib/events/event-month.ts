import { parseDate } from "@internationalized/date";

import {
  getListQuery,
  shiftDate,
  type EventSearchParams,
} from "@/lib/events/event-list";

export function monthRange(date: string) {
  const first = parseDate(date).set({ day: 1 });
  return {
    from: first.toString(),
    to: first.add({ months: 1 }).subtract({ days: 1 }).toString(),
  };
}

export function shiftMonth(date: string, months: number) {
  return parseDate(date).set({ day: 1 }).add({ months }).toString();
}

export function getMonthQuery(
  params: EventSearchParams,
  city: string,
  today: string,
) {
  const query = getListQuery(params, city);
  const range = monthRange(query.range.from ?? query.range.to ?? today);
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

export function monthWeeks(date: string) {
  const range = monthRange(date);
  const first = shiftDate(
    range.from,
    -new Date(`${range.from}T12:00:00Z`).getUTCDay(),
  );
  const weeks: string[][] = [];
  for (let start = first; start <= range.to; start = shiftDate(start, 7)) {
    weeks.push(
      Array.from({ length: 7 }, (_, index) => shiftDate(start, index)),
    );
  }
  return weeks;
}
