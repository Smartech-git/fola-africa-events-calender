import { parseDateTime, toZoned } from "@internationalized/date";
import {
  APIError,
  commitTransaction,
  createLocalReq,
  initTransaction,
  killTransaction,
  type PayloadHandler,
  type PayloadRequest,
} from "payload";
import { z } from "zod";

import { roleOf } from "@/payload/access";
import { PRIVATE_ACCESS } from "@/payload/constants";
import { formatSlug } from "@/payload/fields/format-slug";
import {
  IMPORT_CHOICES,
  IMPORT_CHUNK,
  IMPORT_COLUMNS,
  MAX_IMPORT_ROWS,
  type ImportRow,
  type ImportStatus,
  type ImportValues,
  type RowCheck,
  type RowResult,
} from "@/payload/imports/event-import-columns";
import {
  actionURL,
  eventProblems,
  instagramProfile,
  webURL,
} from "@/payload/validation";
import type { City, Event, EventImport } from "@/payload-types";

type Choice = { label: string; value: string };

interface Lookup {
  cities: City[];
  /** Organisers by the slug of their name. */
  organisers: Map<string, { id: number; isDemo: boolean }>;
  /** Venues by `${cityId}:${slug of their name}`. */
  venues: Map<string, { id: number; isDemo: boolean }>;
}

interface Prepared {
  check: RowCheck;
  city?: City;
  titleSlug: string;
  /** Same city, start and title: one happening, whichever row or record. */
  key?: string;
  data: Record<string, unknown>;
  organiser?: { id?: number; name: string };
  venue?: { id?: number; name: string; area: string; address: string };
  existing?: Pick<Event, "id" | "status">;
}

const trusted = { overrideAccess: true, depth: 0 } as const;

async function loadLookup(req: PayloadRequest): Promise<Lookup> {
  const [cities, organisers, venues] = await Promise.all([
    req.payload.find({
      collection: "cities",
      pagination: false,
      req,
      ...trusted,
    }),
    req.payload.find({
      collection: "organisers",
      pagination: false,
      select: { name: true, isDemo: true },
      req,
      ...trusted,
    }),
    req.payload.find({
      collection: "venues",
      pagination: false,
      select: { name: true, city: true, isDemo: true },
      req,
      ...trusted,
    }),
  ]);
  return {
    cities: cities.docs,
    organisers: new Map(
      organisers.docs.map((organiser) => [
        formatSlug(organiser.name),
        { id: organiser.id, isDemo: Boolean(organiser.isDemo) },
      ]),
    ),
    venues: new Map(
      venues.docs.map((venue) => [
        `${typeof venue.city === "object" ? venue.city.id : venue.city}:${formatSlug(venue.name)}`,
        { id: venue.id, isDemo: Boolean(venue.isDemo) },
      ]),
    ),
  };
}

const sameWords = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase() ||
  formatSlug(a) === formatSlug(b);

function findCity(cities: City[], value: string) {
  return cities.find(
    (city) => sameWords(city.name, value) || city.slug === formatSlug(value),
  );
}

function choose(options: readonly Choice[], value: string) {
  return options.find(
    (option) =>
      sameWords(option.label, value) || sameWords(option.value, value),
  )?.value;
}

function yesNo(value: string) {
  const answer = value.trim().toLowerCase();
  if (["", "no", "n", "false", "0"].includes(answer)) return false;
  if (["yes", "y", "true", "1"].includes(answer)) return true;
  return undefined;
}

/** "9:30" → "09:30"; 24-hour times only. */
function clock(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : undefined;
}

/** A city wall time as an instant; undefined when it isn't a real time there. */
function instant(date: string, time: string, timeZone: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
  try {
    const local = `${date}T${time}`;
    if (parseDateTime(local).toString() !== `${local}:00`) return undefined;
    return toZoned(parseDateTime(local), timeZone, "reject")
      .toDate()
      .toISOString();
  } catch {
    return undefined;
  }
}

async function prepareRow(
  req: PayloadRequest,
  lookup: Lookup,
  { row, values }: ImportRow,
  status: ImportStatus,
): Promise<Prepared> {
  const value = (name: keyof ImportValues) => values[name]?.trim() ?? "";
  const errors: string[] = [];
  const notes: string[] = [];
  const title = value("title");
  const titleSlug = formatSlug(title);
  const check: RowCheck = {
    row,
    title,
    city: value("city"),
    ok: false,
    errors,
    notes,
  };
  const prepared: Prepared = { check, titleSlug, data: {} };

  for (const { name } of IMPORT_COLUMNS.filter(
    (column) => "required" in column && column.required,
  ))
    if (!value(name)) errors.push(`Add the ${name.replace(/_/g, " ")}.`);
  if (title && !titleSlug)
    errors.push("Include letters or numbers in the title.");

  const city = value("city")
    ? findCity(lookup.cities, value("city"))
    : undefined;
  if (value("city") && !city)
    errors.push(`“${value("city")}” isn’t a city on Happenings.`);
  prepared.city = city;

  const choices = Object.fromEntries(
    IMPORT_CHOICES.map(({ column, options }) => {
      const raw = value(column);
      const chosen = raw ? choose(options, raw) : undefined;
      if (raw && !chosen)
        errors.push(
          `“${raw}” isn’t a valid ${column.replace(/_/g, " ")}. Use one of: ${options.map((option) => option.label).join(", ")}.`,
        );
      return [column, chosen];
    }),
  ) as Record<(typeof IMPORT_CHOICES)[number]["column"], string | undefined>;
  const visibility =
    choices.visibility ?? (value("visibility") ? undefined : "public");

  const allDay = yesNo(value("all_day"));
  if (allDay === undefined) errors.push("Use yes or no for all day.");
  const startTime = value("start_time")
    ? clock(value("start_time"))
    : allDay
      ? "00:00"
      : undefined;
  if (!value("start_time") && !allDay)
    errors.push("Add a start time, or mark the happening all day.");
  else if (!startTime) errors.push("Write the start time as 24-hour HH:MM.");
  const endTime = value("end_time") ? clock(value("end_time")) : undefined;
  if (value("end_time") && !endTime)
    errors.push("Write the end time as 24-hour HH:MM.");
  if (value("end_date") && !value("end_time") && !allDay)
    errors.push("Add an end time for the end date.");

  let startAt: string | undefined;
  let endAt: string | undefined;
  if (city && value("start_date") && startTime) {
    startAt = instant(value("start_date"), startTime, city.timezone);
    if (!startAt)
      errors.push(
        `Check the start date (YYYY-MM-DD) and time; it must exist in ${city.name}.`,
      );
    const endDate = value("end_date") || value("start_date");
    const endClock = endTime ?? (allDay && value("end_date") ? "23:59" : "");
    if (endClock) {
      endAt = instant(endDate, endClock, city.timezone);
      if (!endAt)
        errors.push(
          `Check the end date (YYYY-MM-DD) and time; it must exist in ${city.name}.`,
        );
    }
  }

  const actionUrl = value("action_url")
    ? actionURL(value("action_url"))
    : undefined;
  if (value("action_url") && !actionUrl)
    errors.push("The action URL must be a web address or an email address.");
  const website = value("website") ? webURL(value("website")) : undefined;
  if (value("website") && !website)
    errors.push("The website must be a web address.");
  const instagram = value("instagram")
    ? instagramProfile(value("instagram"))
    : undefined;
  if (value("instagram") && !instagram)
    errors.push("Use an Instagram handle or profile link.");
  const email = value("public_contact_email").toLowerCase();
  if (email && !z.email().safeParse(email).success)
    errors.push("The public contact email isn’t valid.");
  const sourceUrl = value("source_url")
    ? webURL(value("source_url"))
    : undefined;
  if (value("source_url") && !sourceUrl)
    errors.push("The source URL must be a web address.");

  prepared.data = {
    title,
    city: city?.id,
    startAt,
    endAt: endAt ?? null,
    allDay: Boolean(allDay),
    industry: choices.industry,
    eventType: choices.event_type,
    access: choices.access,
    visibility,
    actionUrl: actionUrl ?? null,
    website: website ?? null,
    instagram: instagram ?? null,
    publicContactEmail: email || null,
    description: value("description") || null,
    sourceUrl: sourceUrl ?? null,
  };
  // Only the rules a complete row can be judged by; missing parts are reported above.
  if (startAt && choices.access) errors.push(...eventProblems(prepared.data));

  if (value("organiser")) {
    const found = lookup.organisers.get(formatSlug(value("organiser")));
    if (found?.isDemo)
      errors.push(`“${value("organiser")}” is a demo organiser.`);
    else {
      prepared.organiser = { id: found?.id, name: value("organiser") };
      if (!found) notes.push(`Creates organiser “${value("organiser")}”.`);
    }
  }
  if (value("venue") && city) {
    const found = lookup.venues.get(`${city.id}:${formatSlug(value("venue"))}`);
    if (found?.isDemo) errors.push(`“${value("venue")}” is a demo venue.`);
    else {
      prepared.venue = {
        id: found?.id,
        name: value("venue"),
        area: value("venue_area"),
        address: value("venue_address"),
      };
      if (!found)
        notes.push(`Creates venue “${value("venue")}” in ${city.name}.`);
    }
  }
  if (
    status === "published" &&
    choices.access &&
    PRIVATE_ACCESS.includes(choices.access)
  )
    notes.push(
      "Private listing: publishing confirms the organiser approved it.",
    );

  if (city && startAt && titleSlug) {
    prepared.key = `${city.id}|${startAt}|${titleSlug}`;
    if (sourceUrl) {
      const { docs } = await req.payload.find({
        collection: "events",
        where: { sourceUrl: { equals: sourceUrl } },
        select: { source: true, status: true, isDemo: true },
        limit: 1,
        req,
        ...trusted,
      });
      const match = docs[0];
      if (match?.source === "submission" || match?.isDemo)
        errors.push(
          `The source URL belongs to event #${match.id}, which can’t be updated by import.`,
        );
      else if (match) {
        prepared.existing = match;
        check.action = "update";
        notes.push(`Updates event #${match.id}.`);
      }
    }
    if (!prepared.existing) {
      const { docs } = await req.payload.find({
        collection: "events",
        where: {
          and: [
            { city: { equals: city.id } },
            { startAt: { equals: startAt } },
            { isDemo: { not_equals: true } },
          ],
        },
        select: { title: true },
        pagination: false,
        req,
        ...trusted,
      });
      const duplicate = docs.find(
        (event) => formatSlug(event.title) === titleSlug,
      );
      if (duplicate)
        errors.push(`Already on the calendar as event #${duplicate.id}.`);
      else check.action = "create";
    }
  }

  check.ok = errors.length === 0;
  return prepared;
}

/** A free slug: the name's own, else scoped by city and date, then numbered. */
async function freeSlug(
  req: PayloadRequest,
  collection: "events" | "venues" | "organisers",
  base: string,
  scope: string,
) {
  const taken = async (slug: string) =>
    (
      await req.payload.count({
        collection,
        where: { slug: { equals: slug } },
        req,
        overrideAccess: true,
      })
    ).totalDocs > 0;
  if (!(await taken(base))) return base;
  const scoped = `${base}-${scope}`;
  let slug = scoped;
  for (let suffix = 2; await taken(slug); suffix++)
    slug = `${scoped}-${suffix}`;
  return slug;
}

async function saveRow(
  req: PayloadRequest,
  lookup: Lookup,
  prepared: Prepared,
  status: ImportStatus,
): Promise<RowResult> {
  const { check, city, data, existing } = prepared;
  const rowReq = await createLocalReq(
    { user: req.user ?? undefined },
    req.payload,
  );
  const own = await initTransaction(rowReq);
  try {
    let organiser = prepared.organiser?.id;
    if (prepared.organiser && !organiser)
      organiser = (
        await req.payload.create({
          collection: "organisers",
          data: {
            name: prepared.organiser.name,
            slug: await freeSlug(
              rowReq,
              "organisers",
              formatSlug(prepared.organiser.name),
              city!.slug,
            ),
          },
          req: rowReq,
          ...trusted,
        })
      ).id;
    let venue = prepared.venue?.id;
    if (prepared.venue && !venue)
      venue = (
        await req.payload.create({
          collection: "venues",
          data: {
            name: prepared.venue.name,
            slug: await freeSlug(
              rowReq,
              "venues",
              formatSlug(prepared.venue.name),
              city!.slug,
            ),
            city: city!.id,
            area: prepared.venue.area || undefined,
            address: prepared.venue.address || undefined,
          },
          req: rowReq,
          ...trusted,
        })
      ).id;

    // Publishing a private listing here is the administrator's confirmation.
    const confirmed =
      status === "published" && PRIVATE_ACCESS.includes(String(data.access));
    const fields = {
      ...data,
      organiser: organiser ?? null,
      venue: venue ?? null,
      ...(confirmed && { organiserConfirmed: true }),
    };
    let eventId: number;
    if (existing) {
      // A cancelled or postponed happening keeps its state.
      const keep = ["cancelled", "postponed"].includes(existing.status);
      eventId = (
        await req.payload.update({
          collection: "events",
          id: existing.id,
          data: { ...fields, ...(!keep && { status }) } as Partial<Event>,
          req: rowReq,
          ...trusted,
        })
      ).id;
    } else {
      eventId = (
        await req.payload.create({
          collection: "events",
          data: {
            ...fields,
            slug: await freeSlug(
              rowReq,
              "events",
              prepared.titleSlug,
              `${city!.slug}-${formatSlug(String(data.startAt))}`,
            ),
            source: "csv",
            status,
            verified: false,
            isDemo: false,
          } as Event,
          req: rowReq,
          ...trusted,
        })
      ).id;
    }
    if (own) await commitTransaction(rowReq);
    // Later rows reuse what this one created.
    if (prepared.organiser && organiser)
      lookup.organisers.set(formatSlug(prepared.organiser.name), {
        id: organiser,
        isDemo: false,
      });
    if (prepared.venue && venue)
      lookup.venues.set(`${city!.id}:${formatSlug(prepared.venue.name)}`, {
        id: venue,
        isDemo: false,
      });
    return { row: check.row, ok: true, action: check.action, eventId };
  } catch (error) {
    if (own) await killTransaction(rowReq);
    return {
      row: check.row,
      ok: false,
      error:
        error instanceof APIError || error instanceof Error
          ? error.message
          : "This row couldn’t be saved.",
    };
  }
}

const bodySchema = z.object({
  mode: z.enum(["check", "import"]),
  status: z.enum(["published", "submitted"]),
  fileName: z.string().trim().max(200).default(""),
  importId: z.number().int().positive().optional(),
  totalRows: z.number().int().min(0).optional(),
  rows: z
    .array(
      z.object({
        row: z.number().int().min(2),
        values: z.record(z.string(), z.string().max(5000)),
      }),
    )
    .min(1)
    .max(MAX_IMPORT_ROWS),
});

const failure = (message: string, status: number) =>
  Response.json({ errors: [{ message }] }, { status });

/**
 * POST /api/events/import. Administrators only.
 * - mode "check": validates every row of a file and saves nothing;
 * - mode "import": saves up to IMPORT_CHUNK rows, each in its own transaction,
 *   and records them on the event-imports log (created on the first chunk).
 */
export const eventImportHandler: PayloadHandler = async (req) => {
  if (roleOf(req.user) !== "admin")
    return failure("Only administrators can import events.", 403);
  const parsed = bodySchema.safeParse(await req.json?.().catch(() => null));
  if (!parsed.success)
    return failure(parsed.error.issues[0]?.message ?? "Invalid import.", 400);
  const { mode, status, rows } = parsed.data;
  const lookup = await loadLookup(req);

  if (mode === "check") {
    const seen = new Map<string, number>();
    const checks: RowCheck[] = [];
    for (const row of rows as ImportRow[]) {
      const prepared = await prepareRow(req, lookup, row, status);
      const key = prepared.key;
      if (key && seen.has(key)) {
        prepared.check.errors.push(`Same happening as row ${seen.get(key)}.`);
        prepared.check.ok = false;
      } else if (key) seen.set(key, row.row);
      checks.push(prepared.check);
    }
    return Response.json({ rows: checks });
  }

  if (rows.length > IMPORT_CHUNK)
    return failure(`Send at most ${IMPORT_CHUNK} rows at a time.`, 400);
  let log: EventImport;
  if (parsed.data.importId) {
    log = await req.payload.findByID({
      collection: "event-imports",
      id: parsed.data.importId,
      req,
      ...trusted,
    });
    if (String(log.importedBy) !== String(req.user!.id))
      return failure("This import belongs to someone else.", 403);
  } else
    log = await req.payload.create({
      collection: "event-imports",
      data: {
        fileName: parsed.data.fileName || "events.csv",
        status,
        importedBy: req.user!.id,
        rows: parsed.data.totalRows ?? rows.length,
        created: 0,
        updated: 0,
        failed: 0,
        events: [],
        failures: [],
      },
      req,
      ...trusted,
    });

  const results: RowResult[] = [];
  for (const row of rows as ImportRow[]) {
    const prepared = await prepareRow(req, lookup, row, status);
    results.push(
      prepared.check.ok
        ? await saveRow(req, lookup, prepared, status)
        : {
            row: row.row,
            ok: false,
            error: prepared.check.errors.join(" "),
          },
    );
  }

  const saved = results.filter((result) => result.ok);
  const count = (action: "create" | "update") =>
    saved.filter((result) => result.action === action).length;
  const failed = results.filter((result) => !result.ok);
  await req.payload.update({
    collection: "event-imports",
    id: log.id,
    data: {
      created: (log.created ?? 0) + count("create"),
      updated: (log.updated ?? 0) + count("update"),
      failed: (log.failed ?? 0) + failed.length,
      events: [
        ...(log.events ?? []).map((event) =>
          typeof event === "object" ? event.id : event,
        ),
        ...saved.map((result) => result.eventId!),
      ],
      failures: [
        ...((log.failures as { row: number; error?: string }[]) ?? []),
        ...failed.map(({ row, error }) => ({ row, error })),
      ],
    },
    req,
    ...trusted,
  });
  return Response.json({ importId: log.id, results });
};
