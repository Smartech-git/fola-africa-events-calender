import DrawHorizontalLine from "@/components/animations/draw-horizontal-line";
import EventList from "@/components/contents/events/event-list";
import EventMonth from "@/components/contents/events/event-month";
import EventSearch from "@/components/contents/events/event-search";
import EventWeek from "@/components/contents/events/event-week";
import FilterMenu from "@/components/contents/events/filter-menu";
import SectionWrapper from "@/components/layout/section-wrapper";
import type { EventSearchParams } from "@/lib/events/event-list";
import { getCities } from "@/requests/get-cities";
import { getEventCalendar } from "@/requests/helpers/get-event-calendar";
import type { CalendarCity, SeasonSummary } from "@/requests/helpers/types";

export default async function EventCalendar({
  city,
  data,
  filters,
  seasons,
  season,
}: {
  city: string;
  data: CalendarCity;
  filters: EventSearchParams;
  seasons: SeasonSummary[];
  season?: SeasonSummary;
}) {
  const [calendar, cities] = await Promise.all([
    getEventCalendar({ city, timezone: data.timezone, filters, season }),
    getCities({}),
  ]);
  const common = {
    cityName: data.name,
    timezone: data.timezone,
    today: calendar.today,
    invalidFilters: calendar.invalidFilters,
  };
  const key = JSON.stringify([city, season?.slug, filters]);
  return (
    <>
      <SectionWrapper className="grid items-center gap-4 gap-y-4 py-4 sm:py-4 md:grid-cols-[minmax(250px,1fr)_auto]">
        <EventSearch />
        <FilterMenu
          cities={cities.data}
          currentCity={city}
          seasonSelected={Boolean(season)}
          defaultDateFrom={calendar.defaultDateFrom}
          defaultDateTo={calendar.defaultDateTo}
        />
        <DrawHorizontalLine className="pointer-events-none absolute top-0 left-0 animate-delay-300" />
        <DrawHorizontalLine className="pointer-events-none absolute bottom-0 left-0 animate-delay-500" />
      </SectionWrapper>
      {calendar.isMonth ? (
        <EventMonth
          key={key}
          {...common}
          query={calendar.monthQuery}
          events={calendar.events}
          seasons={seasons}
          error={calendar.initialError}
        />
      ) : calendar.isWeek ? (
        <EventWeek
          key={key}
          {...common}
          query={calendar.weekQuery}
          events={calendar.events}
          seasons={seasons}
          error={calendar.initialError}
        />
      ) : (
        <EventList
          key={key}
          {...common}
          city={city}
          view={calendar.isDay ? "day" : "list"}
          query={calendar.query}
          initialEvents={calendar.events}
          initialError={calendar.initialError}
        />
      )}
    </>
  );
}
