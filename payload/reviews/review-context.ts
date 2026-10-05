import type { PayloadRequest } from "payload";

import {
  ACCESS_OPTIONS,
  EVENT_TYPES,
  INDUSTRIES,
  VISIBILITY_OPTIONS,
} from "@/payload/constants";
import { eventSnapshot } from "@/payload/reviews/event-snapshot";
import type { ReviewResult } from "@/payload/reviews/review-schema";
import { relationID } from "@/payload/validation";
import type { Event } from "@/payload-types";

export async function reviewContext(event: Event, req: PayloadRequest) {
  const { payload } = req;
  const cityId = relationID(event.city)!;
  const [city, organiser, venue, nearby, venues] = await Promise.all([
    payload.findByID({ collection: "cities", id: cityId, depth: 0, req }),
    event.organiser
      ? payload.findByID({
          collection: "organisers",
          id: relationID(event.organiser)!,
          depth: 0,
          req,
        })
      : null,
    event.venue
      ? payload.findByID({
          collection: "venues",
          id: relationID(event.venue)!,
          depth: 0,
          req,
        })
      : null,
    payload.find({
      collection: "events",
      depth: 0,
      limit: 8,
      sort: "startAt",
      req,
      where: {
        and: [
          { id: { not_equals: event.id } },
          { city: { equals: cityId } },
          { isDemo: { not_equals: true } },
          {
            status: { in: ["submitted", "approved", "published", "postponed"] },
          },
          {
            startAt: {
              less_than_equal: new Date(
                Date.parse(event.endAt || event.startAt) + 86_400_000,
              ).toISOString(),
            },
          },
          {
            or: [
              {
                endAt: {
                  greater_than_equal: new Date(
                    Date.parse(event.startAt) - 86_400_000,
                  ).toISOString(),
                },
              },
              {
                startAt: {
                  greater_than_equal: new Date(
                    Date.parse(event.startAt) - 86_400_000,
                  ).toISOString(),
                },
              },
            ],
          },
        ],
      },
    }),
    payload.find({
      collection: "venues",
      depth: 0,
      limit: 20,
      req,
      where: {
        and: [
          { city: { equals: cityId } },
          { isDemo: { not_equals: true } },
          ...(event.submittedVenue?.name
            ? [{ name: { like: event.submittedVenue.name } }]
            : []),
        ],
      },
    }),
  ]);
  const organiserDetails = event.submittedOrganiser?.name
    ? event.submittedOrganiser
    : organiser;
  const venueDetails = event.submittedVenue?.name
    ? event.submittedVenue
    : venue;
  if (!organiserDetails?.name)
    throw new Error("No submitted organiser details are available for review.");
  const organisers = await payload.find({
    collection: "organisers",
    depth: 0,
    limit: 20,
    req,
    where: {
      and: [
        { name: { like: organiserDetails.name.slice(0, 200) } },
        { isDemo: { not_equals: true } },
      ],
    },
  });
  const organiserSummary = (item: {
    id?: number;
    name?: string | null;
    type?: string | null;
  }) => ({
    id: item.id ?? null,
    name: item.name,
    type: item.type,
  });
  const venueSummary = (item: {
    id?: number;
    name?: string | null;
    area?: string | null;
    address?: string | null;
  }) => ({
    id: item.id ?? null,
    name: item.name,
    area: item.area,
    address: item.address,
  });
  const snapshot = eventSnapshot(event);
  delete snapshot.submittedOrganiser;
  delete snapshot.submittedVenue;
  return {
    event: {
      ...snapshot,
      organiser: organiserSummary(organiserDetails),
      venue: venueDetails?.name ? venueSummary(venueDetails) : null,
    },
    city: { name: city.name, country: city.country, timezone: city.timezone },
    authority: {
      relationship: event.submittedBy?.relationship,
      organiserConfirmed: !!event.organiserConfirmed,
    },
    candidates: {
      events: nearby.docs.map((item) => ({
        id: item.id,
        title: item.title,
        startAt: item.startAt,
        endAt: item.endAt,
        organiser: relationID(item.organiser),
        venue: relationID(item.venue),
      })),
      organisers: organisers.docs.map(organiserSummary),
      venues: venues.docs.map(venueSummary),
    },
    vocabulary: {
      industries: INDUSTRIES,
      eventTypes: EVENT_TYPES,
      access: ACCESS_OPTIONS,
      visibility: VISIBILITY_OPTIONS,
    },
  };
}

export function validateReviewMatches(
  result: ReviewResult,
  context: Awaited<ReturnType<typeof reviewContext>>,
) {
  const { findings } = result;
  const checks = [
    [
      findings.duplicateEventIds.concat(findings.clashingEventIds),
      context.candidates.events,
    ],
    [findings.organiserMatchIds, context.candidates.organisers],
    [findings.venueMatchIds, context.candidates.venues],
  ] as const;
  if (
    checks.some(([ids, candidates]) =>
      ids.some((id) => !candidates.some((item) => item.id === id)),
    )
  )
    throw new Error(
      "AI review referenced a record that was not supplied. Retry or review manually.",
    );
  if (
    (result.suggestedListing.description?.trim().split(/\s+/u).length ?? 0) > 60
  )
    throw new Error(
      "AI suggested a description longer than 60 words. Retry or review manually.",
    );
}
