import EventCalendar from "@/components/contents/events/event-calendar";
import EventsHeader from "@/components/contents/events/events-header";
import { SITE_NAME } from "@/constants/brand";
import type { EventSearchParams } from "@/lib/events/event-list";
import { pageMetadata } from "@/lib/metadata";
import { getEventsHeader } from "@/requests/events/get-events-header";
import { getCities } from "@/requests/get-cities";

interface Props {
  params: Promise<{ city: string }>;
  searchParams: Promise<EventSearchParams>;
}

export async function generateMetadata({ params }: Props) {
  const { city } = await params;
  const header = await getEventsHeader({ city });
  return pageMetadata(
    `What’s happening in ${header.city.name}?`,
    `See what’s happening in ${header.city.name}. Browse ${SITE_NAME} by date, industry and access.`,
    `/calendar/${encodeURIComponent(city)}`,
  );
}

export default async function Page({ params, searchParams }: Props) {
  const [{ city }, filters] = await Promise.all([params, searchParams]);
  const [header, cities] = await Promise.all([
    getEventsHeader({ city }),
    getCities({}),
  ]);
  return (
    <div className="relative -mt-sm-header flex w-full flex-col sm:-mt-header">
      <EventsHeader data={header} cities={cities.data} citySlug={city} />
      <EventCalendar
        city={city}
        data={header.city}
        seasons={header.seasons}
        filters={filters}
      />
    </div>
  );
}
