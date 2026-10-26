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
import type { SeasonSummary } from "@/requests/helpers/types";
import type { City } from "@/types/payload-types";

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

const SEARCH_MAX_LENGTH = 100;
// Caps the related records a single query can expand into.
const SEARCH_RELATION_LIMIT = 200;

export function searchTerm(params: URLSearchParams) {
  const value = params.get("search")?.trim().replace(/\s+/g, " ");
  if (!value) return undefined;
  if (value.length > SEARCH_MAX_LENGTH)
    throw new CalendarQueryError(
      `search must be ${SEARCH_MAX_LENGTH} characters or fewer.`,
    );
  return value;
}

/**
 * Match only text the public projection shows: titles and seasons on Public and
 * Industry listings, organiser and venue names on Public listings only. Held
 * dates never match, because their real title and relations are concealed.
 */
async function searchFilter(
  payload: Payload,
  term: string,
  city: City,
): Promise<Where> {
  const relationIds = async (
    collection: "organisers" | "venues" | "seasons",
    where: Where[],
  ) => {
    const result = await payload.find({
      collection,
      where: { and: [{ name: { like: term } }, ...where] },
      limit: SEARCH_RELATION_LIMIT,
      depth: 0,
      overrideAccess: true,
      // Selecting one field also skips the seasons' inverse events join.
      select: { name: true },
    });
    return result.docs.map((doc) => doc.id);
  };
  const [organisers, venues, seasons] = await Promise.all([
    relationIds("organisers", []),
    relationIds("venues", [{ city: { equals: city.id } }]),
    relationIds("seasons", [
      { city: { equals: city.id } },
      { isPublished: { equals: true } },
      { isDemo: { not_equals: true } },
    ]),
  ]);
  const listed: Where = { visibility: { in: ["public", "industry"] } };
  const isPublic: Where = { visibility: { equals: "public" } };
  const matches: Where[] = [{ and: [listed, { title: { like: term } }] }];
  if (organisers.length)
    matches.push({ and: [isPublic, { organiser: { in: organisers } }] });
  if (venues.length)
    matches.push({ and: [isPublic, { venue: { in: venues } }] });
  if (seasons.length)
    matches.push({ and: [listed, { seasons: { in: seasons } }] });
  return { or: matches };
}

export async function queryEventsByCity(
  payload: Payload,
  params: URLSearchParams,
) {
  const city = await findCity(payload, params);
  return queryEvents(payload, params, city);
}

export async function queryEventsBySeasons(
  payload: Payload,
  params: URLSearchParams,
) {
  const season = await findSeason(payload, params.get("seasons"));
  const city = await findCity(
    payload,
    new URLSearchParams({ city: String(season.city) }),
  );
  return queryEvents(payload, params, city, [{ seasons: { in: [season.id] } }]);
}

/** Events the public calendar may show for a city (matches toPublicEvent). */
function publicEventFilters(city: City): Where[] {
  return [
    { city: { equals: city.id } },
    { status: { in: PUBLIC_STATUSES } },
    { isDemo: { not_equals: true } },
    { publishedAt: { exists: true } },
    { approvedBy: { exists: true } },
  ];
}

/** Events that overlap [start, end), including ones ending exactly at start. */
function overlapFilters(start?: string, end?: string): Where[] {
  const filters: Where[] = [];
  if (end) filters.push({ startAt: { less_than: end } });
  if (start)
    filters.push({
      or: [
        { endAt: { greater_than_equal: start } },
        { startAt: { greater_than_equal: start } },
      ],
    });
  return filters;
}

/** Shift a YYYY-MM-DD calendar date by whole days. */
function addDays(date: string, days: number) {
  return new Date(Date.parse(`${date}T00:00:00.000Z`) + days * 86400000)
    .toISOString()
    .slice(0, 10);
}

async function countPublicEvents(
  payload: Payload,
  city: City,
  start: string,
  end: string,
) {
  const { totalDocs } = await payload.count({
    collection: "events",
    where: {
      and: [...publicEventFilters(city), ...overlapFilters(start, end)],
    },
    // Counts only; no raw records leave this function.
    overrideAccess: true,
  });
  return totalDocs;
}

async function queryEvents(
  payload: Payload,
  params: URLSearchParams,
  city: City,
  scope: Where[] = [],
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
  const { start, end } = dateRange(params, city.timezone);
  const search = searchTerm(params);
  const filters: Where[] = [...scope, ...publicEventFilters(city)];
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
  if (search) filters.push(await searchFilter(payload, search, city));
  filters.push(...overlapFilters(start, end));

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

export async function queryEventsHeader(
  payload: Payload,
  params: URLSearchParams,
) {
  const city = await findCity(payload, params);
  const startOfToday = dayBoundary(cityToday(city), city.timezone);
  const result = await payload.find({
    collection: "seasons",
    pagination: false,
    limit: 0,
    depth: 0,
    sort: ["startDate", "id"],
    where: {
      and: [
        { city: { equals: city.id } },
        { isPublished: { equals: true } },
        { isDemo: { not_equals: true } },
        { startDate: { greater_than_equal: startOfToday } },
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
  const seasons = result.docs.map(publicSeason);
  return {
    city: {
      name: city.name,
      timezone: city.timezone,
      timezoneLabel: city.timezoneLabel,
    },
    seasons,
  };
}

/** Today's date (YYYY-MM-DD) in the city's own time zone. */
function cityToday(city: City) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: city.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) =>
    parts.find((entry) => entry.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

const SEASON_SELECT = {
  name: true,
  slug: true,
  startDate: true,
  endDate: true,
  description: true,
  status: true,
} as const;


export async function queryCities(payload: Payload, params: URLSearchParams) {
  const result = await payload.find({
    collection: "cities",
    ...pagination(params),
    sort: "id",
    depth: 0,
    overrideAccess: false,
  });

  const data = await Promise.all(
    result.docs.map(async (city) => {
      const today = cityToday(city);
      const startOfToday = dayBoundary(today, city.timezone);
      const [todayCount, weekCount, seasons] = await Promise.all([
        countPublicEvents(
          payload,
          city,
          startOfToday,
          dayBoundary(today, city.timezone, true),
        ),
        countPublicEvents(
          payload,
          city,
          startOfToday,
          dayBoundary(addDays(today, 6), city.timezone, true),
        ),
        payload.find({
          collection: "seasons",
          limit: 1,
          depth: 0,
          sort: ["startDate", "id"],
          where: {
            and: [
              { city: { equals: city.id } },
              { isPublished: { equals: true } },
              { isDemo: { not_equals: true } },
              { startDate: { exists: true } },
              // Current or upcoming: a season under way still counts.
              { endDate: { greater_than_equal: startOfToday } },
            ],
          },
          // Whitelist public fields; never expose aliases or the events join.
          overrideAccess: true,
          joins: false,
          select: SEASON_SELECT,
        }),
      ]);
      return {
        id: city.id,
        name: city.name,
        slug: city.slug,
        country: city.country,
        timezone: city.timezone,
        timezoneLabel: city.timezoneLabel,
        counts: { today: todayCount, thisWeek: weekCount },
        nextSeason: seasons.docs[0] ? publicSeason(seasons.docs[0]) : null,
      };
    }),
  );

  return publicPage(result, data);
}

/**
 * Published seasons across all cities that have not ended yet, soonest first.
 * A season already under way still counts; it is still in the diary.
 */
export async function queryUpcomingSeasons(
  payload: Payload,
  params: URLSearchParams,
) {
  const result = await payload.find({
    collection: "seasons",
    ...pagination(params),
    depth: 1,
    sort: ["startDate", "id"],
    where: {
      and: [
        { isPublished: { equals: true } },
        { isDemo: { not_equals: true } },
        { startDate: { exists: true } },
        { endDate: { greater_than_equal: new Date().toISOString() } },
      ],
    },
    // Whitelist public fields; never expose aliases or the events join.
    overrideAccess: true,
    joins: false,
    select: { ...SEASON_SELECT, city: true },
  });

  const data = result.docs.map((season) => ({
    ...publicSeason(season),
    city:
      season.city && typeof season.city === "object"
        ? {
            name: season.city.name,
            slug: season.city.slug,
            timezone: season.city.timezone,
          }
        : null,
  }));

  return publicPage(result, data);
}

function publicSeason({
  id,
  name,
  slug,
  startDate,
  endDate,
  description,
  status,
}: SeasonSummary) {
  return { id, name, slug, startDate, endDate, description, status };
}

async function findSeason(payload: Payload, value: string | null) {
  const slug = value?.trim();
  if (!slug) throw new CalendarQueryError("A season slug is required.");
  const result = await payload.find({
    collection: "seasons",
    where: {
      and: [
        { slug: { equals: slug } },
        { isPublished: { equals: true } },
        { isDemo: { not_equals: true } },
        { startDate: { exists: true } },
        { endDate: { exists: true } },
      ],
    },
    limit: 1,
    depth: 0,
    joins: false,
    overrideAccess: true,
    select: {
      name: true,
      slug: true,
      city: true,
      startDate: true,
      endDate: true,
      description: true,
      status: true,
    },
  });
  const season = result.docs[0];
  if (!season) throw new CalendarQueryError("Season not found.", 404);
  return season;
}

export async function querySeasonsHeader(
  payload: Payload,
  params: URLSearchParams,
) {
  const season = await findSeason(payload, params.get("slug"));
  const city = await findCity(
    payload,
    new URLSearchParams({ city: String(season.city) }),
  );
  return {
    season: publicSeason(season),
    city: {
      id: city.id,
      slug: city.slug,
      name: city.name,
      timezone: city.timezone,
      timezoneLabel: city.timezoneLabel,
    },
  };
}
