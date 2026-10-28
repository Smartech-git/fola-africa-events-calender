import { parseISO } from "date-fns";

import Cities from "@/components/contents/home/cities";
import Hero from "@/components/contents/home/hero-two";
import InTheDiary from "@/components/contents/home/in-the-diary";
import Industries from "@/components/contents/home/industries";
import PutItOnHappenings from "@/components/contents/home/put-it-on-happenings";
import ThisWeek from "@/components/contents/home/this-week";
import Header from "@/components/header/header";
import { SITE_NAME } from "@/constants/brand";
import {
  DEFAULT_CITY_NAME,
  DEFAULT_CITY_SLUG,
  DEFAULT_CITY_TIMEZONE,
} from "@/constants/nav";
import {
  cityDate,
  shiftDate,
  type EventSearchParams,
} from "@/lib/events/event-list";
import { pageMetadata, siteDescription } from "@/lib/metadata";
import { getSiteCity } from "@/lib/site-city";
import { getEventList } from "@/requests/events/get-event-list";
import { getCities } from "@/requests/get-cities";
import { getUpcomingSeasons } from "@/requests/seasons/get-upcoming-seasons";

export const metadata = pageMetadata(SITE_NAME, siteDescription, "/");

// "Today" and "this week" depend on the request time in the city.
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<EventSearchParams>;
}

export default async function Home({ searchParams }: Props) {
  const [cities, seasons, requested] = await Promise.all([
    getCities({}),
    getUpcomingSeasons({ limit: 10 }),
    searchParams.then(getSiteCity),
  ]);
  const city = cities.data.find((item) => item.slug === requested) ?? {
    slug: DEFAULT_CITY_SLUG,
    name: DEFAULT_CITY_NAME,
    timezone: DEFAULT_CITY_TIMEZONE,
  };
  const today = cityDate(new Date(), city.timezone);
  const weekStart = shiftDate(today, -parseISO(today).getDay());
  const weekEvents = await getEventList({
    city: city.slug,
    dateFrom: weekStart,
    dateTo: shiftDate(weekStart, 6),
  });

  return (
    <div className="relative -mt-sm-header flex min-h-dvh w-full flex-col items-center bg-primary-light sm:-mt-header">
      <Hero header={<Header isLight />} city={city} cities={cities.data} />
      <ThisWeek
        city={city}
        weekStart={weekStart}
        today={today}
        events={weekEvents}
      />
      <Industries />
      <Cities cities={cities} />

      <InTheDiary seasons={seasons.data} />
      <PutItOnHappenings />
    </div>
  );
}
