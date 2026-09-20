import { INDUSTRIES, PUBLIC_STATUSES } from "@/payload/constants";
import type { Event } from "@/types/payload-types";


/** The only projection that should be used for public pages, exports or API responses. */
export function toPublicEvent(event: Event) {
  if (
    event.isDemo ||
    !PUBLIC_STATUSES.includes(event.status) ||
    !event.publishedAt ||
    !event.approvedBy
  )
    return null;
  const held = event.visibility === "held-date";
  const publicDetails = event.visibility === "public";
  const industry =
    INDUSTRIES.find((entry) => entry.value === event.industry)?.label ||
    event.industry;
  const city =
    typeof event.city === "object"
      ? {
          name: event.city.name,
          slug: event.city.slug,
          timezone: event.city.timezone,
          timezoneLabel: event.city.timezoneLabel,
        }
      : undefined;
  const organiser =
    publicDetails && typeof event.organiser === "object"
      ? {
          name: event.organiser.name,
          type: event.organiser.type,
          website: event.organiser.website,
        }
      : undefined;
  const venue =
    publicDetails && event.venue && typeof event.venue === "object"
      ? {
          name: event.venue.name,
          area: event.venue.area,
          address: event.venue.address,
          mapUrl: event.venue.mapUrl,
        }
      : undefined;

  return {
    id: event.id,
    // Non-public slugs must not reveal a private title.
    slug: held ? `held-${event.id}` : event.slug,
    title: held ? `PRIVATE ${industry.toUpperCase()} EVENT` : event.title,
    city,
    startAt: event.startAt,
    endAt: event.endAt,
    allDay: event.allDay,
    industry: event.industry,
    status: event.status,
    access: held ? "private" : event.access,
    eventType: held ? undefined : event.eventType,
    actionUrl:
      !held && ["tickets", "rsvp", "free"].includes(event.access)
        ? event.actionUrl
        : undefined,
    description: publicDetails ? event.description : undefined,
    organiser,
    venue,
    verified: held ? undefined : event.verified,
    seasons: held
      ? []
      : (event.seasons || []).flatMap((season) =>
          typeof season === "object" && season.isPublished && !season.isDemo
            ? [{ name: season.name, slug: season.slug }]
            : [],
        ),
  };
}
