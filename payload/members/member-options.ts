import "server-only";

import { getCalendarPayload } from "@/payload/queries/calendar-query";

/** Cities for the profile's City select. New cities in Payload appear automatically. */
export async function getMemberCityOptions() {
  const payload = await getCalendarPayload();
  const cities = await payload.find({
    collection: "cities",
    pagination: false,
    depth: 0,
    sort: "name",
    select: { name: true },
  });
  return cities.docs.map(({ id, name }) => ({
    value: String(id),
    label: name,
  }));
}
