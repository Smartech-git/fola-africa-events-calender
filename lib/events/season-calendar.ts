import { cityDate, shiftDate } from "@/lib/events/event-list";
import type { SeasonSummary } from "@/requests/helpers/types";

export function getSeasonDays(
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
export function getSeasonBands(
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
