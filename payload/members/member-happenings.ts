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
}

export const HAPPENING_FILTERS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "pending", label: "Pending review" },
  { value: "live", label: "Live" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
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
    case "upcoming":
      return !ended(happening, now);
    case "pending":
      return happening.status === "submitted";
    case "live":
      return happening.status === "published" && !ended(happening, now);
    case "past":
      return ended(happening, now);
    case "cancelled":
      return happening.status === "cancelled";
  }
}

/** The state as a word, never a coloured pill (Figma: My Happenings). */
export function happeningState(happening: MemberHappening, now = Date.now()) {
  switch (happening.status) {
    case "submitted":
      return "Pending review";
    case "approved":
      return "Approved";
    case "published":
      return ended(happening, now) ? "Ended" : "Live";
    case "cancelled":
      return "Cancelled";
    case "postponed":
      return "Postponed";
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
    return result.docs.map((event) => ({
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
