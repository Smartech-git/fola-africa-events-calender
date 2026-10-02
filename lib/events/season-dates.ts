import { cityDate, formatDay } from "@/lib/events/event-list";
import type { SeasonSummary } from "@/requests/helpers/types";

export function formatSeasonDates(
  season: SeasonSummary,
  timezone: string,
  full = false,
) {
  if (
    !season.startDate ||
    !season.endDate ||
    !Number.isFinite(Date.parse(season.startDate)) ||
    !Number.isFinite(Date.parse(season.endDate))
  )
    return null;
  const from = cityDate(season.startDate, timezone);
  const to = cityDate(season.endDate, timezone);
  const month = full ? "MMMM" : "MMM";
  const endPattern = `dd ${month}${full ? " yyyy" : ""}`;
  if (from === to) return formatDay(from, endPattern);
  if (from.slice(0, 7) === to.slice(0, 7))
    return `${formatDay(from, "dd")}\u2013${formatDay(to, endPattern)}`;
  if (from.slice(0, 4) === to.slice(0, 4))
    return `${formatDay(from, `dd ${month}`)}\u2013${formatDay(to, endPattern)}`;
  return `${formatDay(from, `dd ${month} yyyy`)}\u2013${formatDay(to, `dd ${month} yyyy`)}`;
}
