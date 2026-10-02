import "server-only";

import { PUBLIC_STATUSES } from "@/payload/constants";
import { toPublicEvent } from "@/payload/public-event";
import { getCalendarPayload } from "@/payload/queries/calendar-query";

/** Fetch only publicly released events and return the privacy-safe projection. */
export const getEvent = async (slug: string, city?: string) => {
  const payload = await getCalendarPayload();
  const heldId = /^held-([1-9]\d*)$/.exec(slug)?.[1];
  const result = await payload.find({
    collection: "events",
    depth: 1,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        heldId
          ? {
              id: { equals: Number(heldId) },
              visibility: { equals: "held-date" },
            }
          : { slug: { equals: slug }, visibility: { not_equals: "held-date" } },
        { status: { in: PUBLIC_STATUSES } },
        { isDemo: { not_equals: true } },
        { publishedAt: { exists: true } },
        { approvedBy: { exists: true } },
        ...(city ? [{ "city.slug": { equals: city } }] : []),
      ],
    },
  });
  const event = result.docs[0] ? toPublicEvent(result.docs[0]) : null;
  return event?.city ? event : null;
};
