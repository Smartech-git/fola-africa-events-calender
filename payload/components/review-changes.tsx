import Link from "next/link";

import type { CollectionSlug, Payload, UIFieldServerComponent } from "payload";

import { displayValue } from "@/lib/account/happening-fields";
import styles from "@/payload/components/change-request-diff.module.css";
import { INDUSTRIES } from "@/payload/constants";
import { cityTime } from "@/payload/members/happening-changes";
import {
  editorialFields,
  eventSnapshot,
} from "@/payload/reviews/event-snapshot";
import { relationID } from "@/payload/validation";
import type { City, Event } from "@/payload-types";

type Field = (typeof editorialFields)[number];
type Snapshot = Record<string, unknown>;
type Row = { label: string; before: string; after: string; text?: boolean };

const LABELS: Record<Field, string> = {
  title: "Event name",
  city: "City",
  startAt: "Start",
  endAt: "End",
  allDay: "All day",
  industry: "Industry",
  secondaryIndustry: "Secondary industry",
  eventType: "Event type",
  access: "Who can attend",
  visibility: "What Happenings shows",
  actionUrl: "Ticket or RSVP link",
  website: "Website",
  instagram: "Instagram",
  publicContactEmail: "Public contact email",
  organiser: "Organiser",
  venue: "Venue",
  seasons: "Seasons",
  description: "Description",
  artwork: "Artwork",
  submittedOrganiser: "Submitted organiser",
  submittedVenue: "Submitted venue",
};

const DETAIL_LABELS: Record<string, string> = {
  name: "Name",
  type: "Type",
  website: "Website",
  contactEmail: "Contact email",
  area: "Area",
  address: "Address",
  mapUrl: "Map link",
};

const RELATIONS: Partial<Record<Field, CollectionSlug>> = {
  city: "cities",
  organiser: "organisers",
  venue: "venues",
  seasons: "seasons",
};

const blank = (value: unknown) =>
  value === null || value === undefined || value === "";

/** Same value, ignoring how a date was written and empty-versus-missing. */
function same(field: Field, a: unknown, b: unknown) {
  if (blank(a) && blank(b)) return true;
  if ((field === "startAt" || field === "endAt") && a && b)
    return Date.parse(String(a)) === Date.parse(String(b));
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

async function names(
  payload: Payload,
  collection: CollectionSlug,
  ids: unknown,
) {
  const list = (Array.isArray(ids) ? ids : [ids]).filter((id) => !blank(id));
  if (!list.length) return "";
  const { docs } = await payload.find({
    collection,
    where: { id: { in: list } },
    limit: list.length,
    depth: 0,
    overrideAccess: true,
  });
  return list
    .map((id) => {
      const doc = docs.find((d) => d.id === id) as
        { name?: string; title?: string } | undefined;
      return doc?.name || doc?.title || `#${String(id)}`;
    })
    .join(", ");
}

async function show(
  payload: Payload,
  field: Field,
  value: unknown,
  timeZone: string,
) {
  if (blank(value) || (Array.isArray(value) && !value.length)) return "";
  const relation = RELATIONS[field];
  if (relation) return names(payload, relation, value);
  switch (field) {
    case "startAt":
    case "endAt":
      return displayValue(field, cityTime(String(value), timeZone));
    case "allDay":
    case "industry":
    case "eventType":
    case "access":
    case "visibility":
      return displayValue(field, value);
    case "secondaryIndustry":
      return (
        INDUSTRIES.find((option) => option.value === value)?.label ??
        String(value)
      );
    case "artwork":
      return `Image (media ${String(value)})`;
    default:
      return String(value);
  }
}

/**
 * On an Event Review: what changed on the event since the submission arrived,
 * by the submitter or the team. The AI reviewed the original version.
 * Shown only when something changed.
 */
export const ReviewChanges: UIFieldServerComponent = async ({
  data,
  payload,
}) => {
  const original = data?.originalListing as Snapshot | null | undefined;
  const eventId = relationID(data?.event);
  if (!original || !eventId) return null;
  const event = (await payload.findByID({
    collection: "events",
    id: eventId,
    depth: 0,
    overrideAccess: true,
    disableErrors: true,
  })) as Event | null;
  if (!event) return null;
  const current = eventSnapshot(event) as Snapshot;
  const city = await payload.findByID({
    collection: "cities",
    id: relationID(event.city)!,
    depth: 0,
    overrideAccess: true,
    disableErrors: true,
  });
  const timeZone = (city as City | null)?.timezone || "UTC";

  const rows: Row[] = [];
  for (const field of editorialFields) {
    // Older reviews may predate a field; nothing to compare against.
    if (!(field in original)) continue;
    const before = original[field];
    const after = current[field];
    if (field === "submittedOrganiser" || field === "submittedVenue") {
      const a = (before ?? {}) as Snapshot;
      const b = (after ?? {}) as Snapshot;
      for (const key of new Set([...Object.keys(a), ...Object.keys(b)]))
        if (!same(field, a[key], b[key]))
          rows.push({
            label: `${LABELS[field]} · ${DETAIL_LABELS[key] ?? key}`,
            before: blank(a[key]) ? "" : String(a[key]),
            after: blank(b[key]) ? "" : String(b[key]),
          });
      continue;
    }
    if (same(field, before, after)) continue;
    rows.push({
      label: LABELS[field],
      before: await show(payload, field, before, timeZone),
      after: await show(payload, field, after, timeZone),
      text: field === "description",
    });
  }
  if (!rows.length) return null;

  const edited = event.submitterEditedAt
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone,
      }).format(new Date(event.submitterEditedAt))
    : null;

  return (
    <div className={styles.panel}>
      <h4 className={styles.title}>Changed since submission</h4>
      <p className={styles.lead}>
        The AI reviewed the original version, so its findings and suggestions
        may refer to details that have since changed.
        {edited ? ` The submitter last edited it on ${edited}.` : ""}
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Field</th>
            <th scope="col">When submitted</th>
            <th scope="col">Now</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td className={`${styles.before} ${row.text ? styles.text : ""}`}>
                {row.before || "—"}
              </td>
              <td className={row.text ? styles.text : undefined}>
                {row.after || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.note}>
        Changes by the submitter or the team. Times are in the event’s city.{" "}
        <Link href={`/admin/collections/events/${event.id}`}>
          Open the event
        </Link>
      </p>
    </div>
  );
};
