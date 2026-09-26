import { parseDate } from "@internationalized/date";

import {
  cityDate,
  getListQuery,
  shiftDate,
  type EventSearchParams,
} from "@/lib/events/event-list";
import type { SeasonSummary } from "@/requests/events/get-events-header";

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

export function monthSeasonDays(
  seasons: SeasonSummary[],
  timezone: string,
  range: { from: string; to: string },
) {
  const days = new Map<string, SeasonSummary[]>();
  const ordered = [...seasons].sort(
    (a, b) =>
      (a.startDate ?? "").localeCompare(b.startDate ?? "") || a.id - b.id,
  );
  for (const season of ordered) {
    if (!season.startDate || !season.endDate) continue;
    const from = cityDate(season.startDate, timezone);
    const to = cityDate(season.endDate, timezone);
    for (
      let date = from < range.from ? range.from : from;
      date <= to && date <= range.to;
      date = shiftDate(date, 1)
    ) {
      days.set(date, [...(days.get(date) ?? []), season]);
    }
  }
  return days;
}

// Adjacent dates with the same seasons share a continuous band within the week.
export function weekSeasonBands(
  week: string[],
  days: Map<string, SeasonSummary[]>,
) {
  const bands: { date: string; span: number; seasons: SeasonSummary[] }[] = [];
  for (const date of week) {
    const seasons = days.get(date) ?? [];
    const previous = bands.at(-1);
    if (
      previous &&
      previous.seasons.map((s) => s.id).join(",") ===
        seasons.map((s) => s.id).join(",")
    ) {
      previous.span += 1;
    } else {
      bands.push({ date, span: 1, seasons });
    }
  }
  return bands;
}
