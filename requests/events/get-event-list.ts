"use server";

import type { EventListFilters } from "@/lib/events/event-list";
import {
  getEventsByCity,
  type PublicEvent,
} from "@/requests/events/get-events-by-city";

/** Collect every API page matching the filters before grouping the list. */
export async function getEventList(
  filters: EventListFilters,
): Promise<PublicEvent[]> {
  const events = new Map<number, PublicEvent>();
  let page = 1;
  while (true) {
    const result = await getEventsByCity({
      city: filters.city,
      industry: filters.industry,
      access: filters.access,
      date: filters.date,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      page,
      limit: 100,
    });
    for (const event of result.data) events.set(event.id, event);
    if (!result.hasNextPage) break;
    if (!result.nextPage || result.nextPage <= page)
      throw new Error("Invalid events pagination.");
    page = result.nextPage;
  }
  return [...events.values()];
}
