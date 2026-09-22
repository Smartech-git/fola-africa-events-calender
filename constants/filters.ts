export const CITIES_ID_KEY = "city";
export const EVENTS_LAYOUT_KEY  = "view"

export const FILTER_KEYS = {
  city: CITIES_ID_KEY,
  date: "date",
  dateFrom: "dateFrom",
  dateTo: "dateTo",
  industry: "industry",
  access: "access",
  page: "page",
} as const;

export const EVENTS_FILTER = [
  { label: "City", key: FILTER_KEYS.city },
  { label: "Date", key: FILTER_KEYS.date },
  { label: "Industry", key: FILTER_KEYS.industry },
  { label: "Access", key: FILTER_KEYS.access },
];

export const EVENTS_LAYOUT = [
  {
    label: "List",
    value: "list",
  },
  {
    label: "Week",
    value: "week",
  },
  {
    label: "Month",
    value: "month",
  },
];
