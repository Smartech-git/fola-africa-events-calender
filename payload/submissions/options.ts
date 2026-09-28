import "server-only";

import { getCalendarPayload } from "@/payload/queries/calendar-query";
import { relationID } from "@/payload/validation";

export async function getSubmissionOptions() {
  const payload = await getCalendarPayload();
  const [cities, seasons] = await Promise.all([
    payload.find({
      collection: "cities",
      pagination: false,
      depth: 0,
      sort: "name",
    }),
    payload.find({
      collection: "seasons",
      pagination: false,
      depth: 0,
      sort: "name",
      where: {
        and: [
          { isPublished: { equals: true } },
          { isDemo: { not_equals: true } },
        ],
      },
    }),
  ]);
  return {
    cities: cities.docs.map(({ id, name, timezoneLabel }) => ({
      value: String(id),
      label: name,
      timezoneLabel,
    })),
    seasons: seasons.docs.map(({ id, name, city }) => ({
      value: String(id),
      label: name,
      city: String(relationID(city)),
    })),
  };
}

export type SubmissionOptions = Awaited<
  ReturnType<typeof getSubmissionOptions>
>;
