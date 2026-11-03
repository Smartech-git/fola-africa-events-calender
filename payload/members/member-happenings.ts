import "server-only";

import { cache } from "react";

import { getCalendarPayload } from "@/payload/queries/calendar-query";
import type { City } from "@/payload-types";

export interface MemberHappening {
  id: number;
  title: string;
  slug: string;
  startAt: string;
  endAt?: string | null;
  allDay?: boolean | null;
  status: string;
  access: string;
  visibility: string;
  city: Pick<City, "name" | "slug" | "timezone" | "timezoneLabel"> | null;
  /** Changes to the live listing are waiting for approval. */
  pendingChange: boolean;
}

/** Every happening sits in exactly one filter. */
export const HAPPENING_FILTERS = [
  { value: "live", label: "Live" },
  { value: "pending", label: "Pending review" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Not approved" },
  { value: "past", label: "Past" },
] as const;

export type HappeningFilter = (typeof HAPPENING_FILTERS)[number]["value"];

const ended = (happening: MemberHappening, now: number) =>
  Date.parse(happening.endAt ?? happening.startAt) < now;

export function matchesFilter(
  happening: MemberHappening,
  filter: HappeningFilter,
  now = Date.now(),
) {
  switch (filter) {
    case "live":
      // A postponed listing stays on the calendar.
      return (
        ["published", "postponed"].includes(happening.status) &&
        !ended(happening, now)
      );
    case "pending":
      // Approved happenings wait here until they are published.
      return (
        ["submitted", "approved"].includes(happening.status) &&
        !ended(happening, now)
      );
    case "cancelled":
      return ["cancelled", "withdrawn"].includes(happening.status);
    case "rejected":
      return happening.status === "rejected";
    case "past":
      return (
        ["submitted", "approved", "published", "postponed"].includes(
          happening.status,
        ) && ended(happening, now)
      );
  }
}

/** The first filter with something in it, so the page never opens empty. */
export const defaultFilter = (counts: Record<HappeningFilter, number>) =>
  HAPPENING_FILTERS.find(({ value }) => counts[value])?.value ?? "live";

export function happeningState(happening: MemberHappening, now = Date.now()) {
  switch (happening.status) {
    case "submitted":
      return "Pending review";
    case "approved":
      return happening.pendingChange ? "Changes submitted" : "Approved";
    case "published":
      if (ended(happening, now)) return "Ended";
      return happening.pendingChange ? "Changes submitted" : "Live";
    case "cancelled":
      return "Cancelled";
    case "postponed":
      return happening.pendingChange ? "Changes submitted" : "Postponed";
    case "withdrawn":
      return "Withdrawn";
    case "rejected":
      return "Not approved";
    default:
      return happening.status;
  }
}

/**
 * Every event this member submitted, in date order. These are the member's own
 * records, so private details such as the real title of a held date are shown.
 */
export const getMemberHappenings = cache(
  async (memberId: number): Promise<MemberHappening[]> => {
    const payload = await getCalendarPayload();
    const result = await payload.find({
      collection: "events",
      where: { member: { equals: memberId } },
      pagination: false,
      sort: ["startAt", "id"],
      depth: 1,
      // Raw events are staff-only; the member sees only their own, through these fields.
      overrideAccess: true,
      joins: false,
      select: {
        title: true,
        slug: true,
        startAt: true,
        endAt: true,
        allDay: true,
        status: true,
        access: true,
        visibility: true,
        city: true,
      },
      populate: {
        cities: { name: true, slug: true, timezone: true, timezoneLabel: true },
      },
    });
    const ids = result.docs.map((event) => event.id);
    const pending = ids.length
      ? await payload.find({
          collection: "event-changes",
          where: {
            and: [{ event: { in: ids } }, { status: { equals: "pending" } }],
          },
          pagination: false,
          depth: 0,
          overrideAccess: true,
          select: { event: true },
        })
      : { docs: [] };
    const withChanges = new Set(pending.docs.map((change) => change.event));
    return result.docs.map((event) => ({
      pendingChange: withChanges.has(event.id),
      id: event.id,
      title: event.title,
      slug: event.slug ?? "",
      startAt: event.startAt,
      endAt: event.endAt,
      allDay: event.allDay,
      status: event.status,
      access: event.access,
      visibility: event.visibility,
      city:
        event.city && typeof event.city === "object"
          ? {
              name: event.city.name,
              slug: event.city.slug,
              timezone: event.city.timezone,
              timezoneLabel: event.city.timezoneLabel,
            }
          : null,
    }));
  },
);

export function happeningCounts(happenings: MemberHappening[]) {
  const now = Date.now();
  return Object.fromEntries(
    HAPPENING_FILTERS.map(({ value }) => [
      value,
      happenings.filter((happening) => matchesFilter(happening, value, now))
        .length,
    ]),
  ) as Record<HappeningFilter, number>;
}
