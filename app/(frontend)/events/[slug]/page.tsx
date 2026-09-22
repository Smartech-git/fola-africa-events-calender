import EventList from "@/components/contents/events/event-list";
import EventsHeader from "@/components/contents/events/events-header";
import FilterMenu from "@/components/contents/events/filter-menu";
import {
  cityDate,
  getListQuery,
  type EventSearchParams,
} from "@/lib/events/event-list";
import { getEventList } from "@/requests/events/get-event-list";
import type { PublicEvent } from "@/requests/events/get-events-by-city";
import { getEventsHeader } from "@/requests/events/get-events-header";
import { getCities } from "@/requests/get-cities";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<EventSearchParams>;
}
export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const filters = await searchParams;

  const [eventsHeader, cities] = await Promise.all([
    getEventsHeader({ city: slug }),
    getCities({}),
  ]);

  const today = cityDate(new Date(), eventsHeader.city.timezone);
  
  let query = getListQuery({}, slug);

  let initialError: string | undefined;
  let invalidFilters = false;
  let events: PublicEvent[] = [];
  try {
    query = getListQuery(filters, slug);
  } catch (error) {
    invalidFilters = true;
    initialError =
      error instanceof Error
        ? error.message
        : "Choose valid filters and try again.";
  }
  if (!invalidFilters) {
    try {
      events = await getEventList(query.filters);
    } catch {
      initialError = "We couldn't load events. Please try again.";
    }
  }

  return (
    <>
      <EventsHeader data={eventsHeader} />
      <FilterMenu cities={cities.data} currentCity={slug} />
      <EventList
        key={JSON.stringify([slug, filters])}
        city={slug}
        cityName={eventsHeader.city.name}
        timezone={eventsHeader.city.timezone}
        today={today}
        query={query}
        initialEvents={events}
        initialError={initialError}
        invalidFilters={invalidFilters}
      />
    </>
  );
}
