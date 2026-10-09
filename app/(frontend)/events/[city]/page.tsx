import EventCalendar from "@/components/contents/events/event-calendar";
import EventsHeader from "@/components/contents/events/events-header";
import { SITE_NAME } from "@/constants/brand";
import type { EventSearchParams } from "@/lib/events/event-list";
import { pageMetadata } from "@/lib/metadata";
import { getEventsHeader } from "@/requests/events/get-events-header";

interface Props {
  params: Promise<{ city: string }>;
  searchParams: Promise<EventSearchParams>;
}

export async function generateMetadata({ params }: Props) {
  const { city } = await params;
  const header = await getEventsHeader({ city });
  return pageMetadata(
    `${header.city.name} events`,
    `Explore concerts, exhibitions, business gatherings and more in ${header.city.name}. Browse ${SITE_NAME} by date, industry and access.`,
    `/events/${encodeURIComponent(city)}`,
  );
}

export default async function Page({ params, searchParams }: Props) {
  const [{ city }, filters] = await Promise.all([params, searchParams]);
  const header = await getEventsHeader({ city });
  return (
    <>
      <EventsHeader data={header} />
      <EventCalendar
        city={city}
        data={header.city}
        seasons={header.seasons}
        filters={filters}
      />
    </>
  );
}
