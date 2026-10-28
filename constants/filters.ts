export const FILTER_KEYS = {
  city: "city",
  eventLayoutKey: "view",
  search: "search",
  date: "date",
  dateFrom: "dateFrom",
  dateTo: "dateTo",
  industry: "industry",
  access: "access",
  page: "page",
  homeDate: 'homeDate',
  siteCity : "siteCity"
} as const;

export const EVENTS_FILTER = [
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
    label: "Day",
    value: "day",
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
