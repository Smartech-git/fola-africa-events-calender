import { FILTER_KEYS } from "@/constants/filters";
import { formatDay } from "@/lib/events/event-list";
import { ACCESS_OPTIONS, INDUSTRIES } from "@/payload/constants";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const dayLabel = (value: string) =>
  ISO_DATE.test(value) ? formatDay(value, "EEE dd MMM") : value;

/**
 * Chip labels for the filters in the URL. Week and month views move by date,
 * so they leave dates out: only industry, access and search narrow them.
 */
export function activeFilterLabels(
  params: URLSearchParams,
  { includeDates = true } = {},
) {
  const labels: string[] = [];
  const search = params.get(FILTER_KEYS.search)?.trim();
  if (search) labels.push(`“${search}”`);
  for (const value of params.getAll(FILTER_KEYS.industry))
    labels.push(
      INDUSTRIES.find((item) => item.value === value)?.label ?? value,
    );
  for (const value of params.getAll(FILTER_KEYS.access))
    labels.push(
      ACCESS_OPTIONS.find((item) => item.value === value)?.label ?? value,
    );
  if (!includeDates) return labels;

  const date = params.get(FILTER_KEYS.date);
  const from = params.get(FILTER_KEYS.dateFrom);
  const to = params.get(FILTER_KEYS.dateTo);
  if (date) labels.push(dayLabel(date));
  else if (from && to) labels.push(`${dayLabel(from)} – ${dayLabel(to)}`);
  else if (from) labels.push(`From ${dayLabel(from)}`);
  else if (to) labels.push(`Until ${dayLabel(to)}`);
  return labels;
}
