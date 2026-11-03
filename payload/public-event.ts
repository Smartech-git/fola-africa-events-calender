import {
  INDUSTRIES,
  LINKED_ACCESS,
  PRIVATE_ACCESS,
  PUBLIC_STATUSES,
} from "@/payload/constants";
import type { Event, Media } from "@/payload-types";

type ImageSize = { url: string; width: number; height: number };

/** The artwork sizes a page may show. Never the stored original. */
function publicArtwork(artwork: Event["artwork"]) {
  if (!artwork || typeof artwork !== "object") return undefined;
  const size = (name: keyof NonNullable<Media["sizes"]>): ImageSize | null => {
    const entry = artwork.sizes?.[name];
    return entry?.url && entry.width && entry.height
      ? { url: entry.url, width: entry.width, height: entry.height }
      : null;
  };
  // Small images are not upscaled, so a size can be missing; fall back to the file.
  const original =
    artwork.url && artwork.width && artwork.height
      ? { url: artwork.url, width: artwork.width, height: artwork.height }
      : null;
  const detail = size("detail") ?? original;
  if (!detail) return undefined;
  return {
    alt: artwork.alt,
    detail,
    card: size("card") ?? detail,
    og: size("og"),
  };
}

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
  const industryEntry = INDUSTRIES.find(
    (entry) => entry.value === event.industry,
  );
  const industry =
    industryEntry?.short || industryEntry?.label || event.industry;
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
    publicDetails && event.organiser && typeof event.organiser === "object"
      ? {
          name: event.organiser.name,
          type: event.organiser.type,
          website: event.organiser.website,
        }
      : undefined;
  // Private and invitation-only events never reveal where they are held.
  const venue =
    publicDetails &&
    !PRIVATE_ACCESS.includes(event.access) &&
    event.venue &&
    typeof event.venue === "object"
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
      !held && LINKED_ACCESS.includes(event.access)
        ? event.actionUrl
        : undefined,
    description: publicDetails ? event.description : undefined,
    // Artwork belongs to Full listings only, like the organiser and venue.
    artwork: publicDetails ? publicArtwork(event.artwork) : undefined,
    website: publicDetails ? event.website : undefined,
    instagram: publicDetails ? event.instagram : undefined,
    publicContactEmail: publicDetails ? event.publicContactEmail : undefined,
    organiser,
    venue,
    verified: held ? undefined : event.verified,
    seasons: held
      ? []
      : (event.seasons || []).flatMap((season) =>
          typeof season === "object" && season.isPublished && !season.isDemo
            ? [
                {
                  name: season.name,
                  slug: season.slug,
                  startDate: season.startDate,
                  endDate: season.endDate,
                },
              ]
            : [],
        ),
  };
}
