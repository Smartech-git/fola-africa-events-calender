import {
  getPayload,
  type PaginatedDocs,
  type Payload,
  type Where,
} from "payload";

import {
  ACCESS_OPTIONS,
  INDUSTRIES,
  PUBLIC_STATUSES,
} from "@/payload/constants";
import { toPublicEvent } from "@/payload/public-event";
import config from "@/payload.config";

export function getCalendarPayload() {
  return getPayload({ config });
}

export function calendarError(error: unknown) {
  if (error instanceof CalendarQueryError)
    return Response.json(
      { errors: [{ message: error.message }] },
      { status: error.status },
    );
  console.error("Public calendar query failed", error);
  return Response.json(
    { errors: [{ message: "Unable to fetch calendar data." }] },
    { status: 500 },
  );
}

export class CalendarQueryError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function pagination(params: URLSearchParams) {
  const integer = (key: string, fallback: number, maximum: number) => {
    const value = params.get(key);
    if (value === null) return fallback;
    if (
      !/^[1-9]\d*$/.test(value) ||
      !Number.isSafeInteger(Number(value)) ||
      Number(value) > maximum
    )
      throw new CalendarQueryError(
        `${key} must be an integer between 1 and ${maximum}.`,
      );
    return Number(value);
  };
  return {
    page: integer("page", 1, Number.MAX_SAFE_INTEGER),
    limit: integer("limit", 100, 100),
  };
}

export async function findCity(payload: Payload, params: URLSearchParams) {
  const value = params.get("city")?.trim();
  if (!value)
    throw new CalendarQueryError("city is required (slug or numeric ID).");
  const result = await payload.find({
    collection: "cities",
    where: /^\d+$/.test(value)
      ? { id: { equals: Number(value) } }
      : { slug: { equals: value } },
    limit: 1,
    depth: 0,
    overrideAccess: false,
  });
  if (!result.docs[0]) throw new CalendarQueryError("City not found.", 404);
  return result.docs[0];
}

export function selectedValues(
  params: URLSearchParams,
  key: string,
  allowed: string[],
) {
  const values = [
    ...new Set(params.getAll(key).flatMap((value) => value.split(","))),
  ];
  if (values.some((value) => !allowed.includes(value)))
    throw new CalendarQueryError(
      `Invalid ${key}. Allowed values: ${allowed.join(", ")}.`,
    );
  return values;
}

/** Find the first instant of a local calendar date, including DST transitions. */
function dayBoundary(date: string, timezone: string, nextDay = false) {
  const timestamp = Date.parse(`${date}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== date
  )
    throw new CalendarQueryError(
      "Dates must be valid YYYY-MM-DD calendar dates.",
    );
  const target = new Date(timestamp + (nextDay ? 86400000 : 0))
    .toISOString()
    .slice(0, 10);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const localDate = (instant: number) => {
    const parts = formatter.formatToParts(instant);
    const part = (type: string) =>
      parts.find((entry) => entry.type === type)!.value;
    return `${part("year").padStart(4, "0")}-${part("month")}-${part("day")}`;
  };
  let low = timestamp - 2 * 86400000;
  let high = timestamp + 3 * 86400000;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (localDate(middle) < target) low = middle + 1;
    else high = middle;
  }
  return new Date(low).toISOString();
}

export function dateRange(params: URLSearchParams, timezone: string) {
  const date = params.get("date");
  if (date !== null && (params.has("dateFrom") || params.has("dateTo")))
    throw new CalendarQueryError("Use date or dateFrom/dateTo, not both.");
  const from = date ?? params.get("dateFrom");
  const to = date ?? params.get("dateTo");
  const start = from !== null ? dayBoundary(from, timezone) : undefined;
  const end = to !== null ? dayBoundary(to, timezone, true) : undefined;
  if (from !== null && to !== null && from > to)
    throw new CalendarQueryError("dateFrom cannot be after dateTo.");
  return { start, end };
}

export function publicPage<T, U>(result: PaginatedDocs<T>, data: U[]) {
  return {
    data,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page ?? 1,
    limit: result.limit,
    hasNextPage: result.hasNextPage,
    nextPage: result.nextPage ?? null,
  };
}

export async function queryEventsByCity(
  payload: Payload,
  params: URLSearchParams,
) {
  const paging = pagination(params);
  const industry = selectedValues(
    params,
    "industry",
    INDUSTRIES.map((item) => item.value),
  );
  const access = selectedValues(
    params,
    "access",
    ACCESS_OPTIONS.map((item) => item.value),
  );
  const city = await findCity(payload, params);
  const { start, end } = dateRange(params, city.timezone);
  const filters: Where[] = [
    { city: { equals: city.id } },
    { status: { in: PUBLIC_STATUSES } },
    { isDemo: { not_equals: true } },
    { publishedAt: { exists: true } },
    { approvedBy: { exists: true } },
  ];
  if (industry.length)
    filters.push({
      or: [
        { industry: { in: industry } },
        { secondaryIndustry: { in: industry } },
      ],
    });
  if (access.length)
    filters.push({
      or: [
        {
          and: [
            { visibility: { not_equals: "held-date" } },
            { access: { in: access } },
          ],
        },
        ...(access.includes("private")
          ? [{ visibility: { equals: "held-date" } }]
          : []),
      ],
    });
  // Include events spanning the requested dates; end times are exclusive.
  if (end) filters.push({ startAt: { less_than: end } });
  if (start)
    filters.push({
      or: [
        { endAt: { greater_than: start } },
        { startAt: { greater_than_equal: start } },
      ],
    });
  const result = await payload.find({
    collection: "events",
    where: { and: filters },
    ...paging,
    sort: ["startAt", "id"],
    depth: 1,
    // Raw collection access stays staff-only; only the public projection leaves this route.
    overrideAccess: true,
  });
  const data = result.docs.flatMap((event) => {
    const projected = toPublicEvent(event);
    return projected ? [projected] : [];
  });
  return publicPage(result, data);
}

export async function querySeasonsByCity(
  payload: Payload,
  params: URLSearchParams,
) {
  const paging = pagination(params);
  const city = await findCity(payload, params);
  const result = await payload.find({
    collection: "seasons",
    ...paging,
    depth: 0,
    sort: ["startDate", "id"],
    where: {
      and: [
        { city: { equals: city.id } },
        { isPublished: { equals: true } },
        { isDemo: { not_equals: true } },
        { startDate: { exists: true } },
        { endDate: { exists: true } },
      ],
    },
    // Whitelist public fields; never expose aliases or the inverse events join.
    overrideAccess: true,
    joins: false,
    select: {
      name: true,
      slug: true,
      startDate: true,
      endDate: true,
      description: true,
      status: true,
    },
  });
  const data = result.docs.map(
    ({ id, name, slug, startDate, endDate, description, status }) => ({
      id,
      name,
      slug,
      startDate,
      endDate,
      description,
      status,
    }),
  );
  return publicPage(result, data);
}
