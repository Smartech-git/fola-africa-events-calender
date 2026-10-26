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
import { cityDate, shiftDate } from "@/lib/events/event-list";
import { pageMetadata, siteDescription } from "@/lib/metadata";
import { getEventList } from "@/requests/events/get-event-list";
import { getCities } from "@/requests/get-cities";
import { getUpcomingSeasons } from "@/requests/seasons/get-upcoming-seasons";

export const metadata = pageMetadata(SITE_NAME, siteDescription, "/");

// "Today" and "this week" depend on the request time in the city.
export const dynamic = "force-dynamic";

export default async function Home() {
  const today = cityDate(new Date(), DEFAULT_CITY_TIMEZONE);
  const weekStart = shiftDate(today, -parseISO(today).getDay());

  const [cities, weekEvents, seasons] = await Promise.all([
    getCities({}),
    getEventList({
      city: DEFAULT_CITY_SLUG,
      dateFrom: weekStart,
      dateTo: shiftDate(weekStart, 6),
    }),
    getUpcomingSeasons({ limit: 10 }),
  ]);

  return (
    <div className="relative -mt-sm-header flex min-h-dvh w-full flex-col items-center bg-primary-light sm:-mt-header">
      <Hero header={<Header isLight />} />
      <Industries />
      <Cities cities={cities} />
      <ThisWeek
        city={{
          slug: DEFAULT_CITY_SLUG,
          name: DEFAULT_CITY_NAME,
          timezone: DEFAULT_CITY_TIMEZONE,
        }}
        weekStart={weekStart}
        today={today}
        events={weekEvents}
      />
      <InTheDiary seasons={seasons.data} />
      <PutItOnHappenings />
    </div>
  );
}
