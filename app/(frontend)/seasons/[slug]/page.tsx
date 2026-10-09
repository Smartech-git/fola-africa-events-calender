import EventCalendar from "@/components/contents/events/event-calendar";
import SeasonsHeader from "@/components/contents/seasons/seasons-header";
import { SITE_NAME } from "@/constants/brand";
import type { EventSearchParams } from "@/lib/events/event-list";
import { pageMetadata } from "@/lib/metadata";
import { getSeasonsHeader } from "@/requests/seasons/get-seasons-header";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<EventSearchParams>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { season, city } = await getSeasonsHeader({ slug });
  return pageMetadata(
    season.name,
    season.description ||
      `Explore ${season.name} on ${SITE_NAME}. Browse creative, cultural and business events in ${city.name} by date, industry and access.`,
    `/seasons/${encodeURIComponent(season.slug)}`,
  );
}

export default async function Page({ params, searchParams }: Props) {
  const [{ slug }, filters] = await Promise.all([params, searchParams]);
  const header = await getSeasonsHeader({ slug });
  return (
    <>
      <SeasonsHeader data={header} />
      <EventCalendar
        city={header.city.slug}
        data={header.city}
        seasons={[header.season]}
        season={header.season}
        filters={filters}
      />
    </>
  );
}
