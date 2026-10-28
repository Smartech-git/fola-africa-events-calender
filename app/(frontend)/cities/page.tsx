import CitiesHero from "@/components/contents/cities/cities-hero";
import CitiesTable from "@/components/contents/cities/cities-table";
import { DEFAULT_CITY_SLUG } from "@/constants/nav";
import type { EventSearchParams } from "@/lib/events/event-list";
import { pageMetadata } from "@/lib/metadata";
import { getSiteCity } from "@/lib/site-city";
import { getCities, type CityOverview } from "@/requests/get-cities";

export const metadata = pageMetadata(
  "Cities",
  "Choose a city and see what’s happening across Africa’s cities.",
  "/cities",
);

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<EventSearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const siteCity = await getSiteCity(await searchParams);
  let cities: CityOverview[] = [];
  try {
    cities = (await getCities({})).data;
  } catch (error) {
    console.error("Cities request failed", error);
  }

  return (
    <div className="relative -mt-sm-header flex w-full flex-col sm:-mt-header">
      <CitiesHero />
      <CitiesTable
        cities={cities}
        currentCity={siteCity ?? DEFAULT_CITY_SLUG}
      />
    </div>
  );
}
