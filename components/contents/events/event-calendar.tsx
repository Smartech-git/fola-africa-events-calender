import EventFilter from "@/components/contents/events/event-filter";
import EventList from "@/components/contents/events/event-list";
import EventMonth from "@/components/contents/events/event-month";
import EventWeek from "@/components/contents/events/event-week";
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
      <SectionWrapper className="border-b border-ink/20 py-3 md:py-4">
        <EventFilter
          cities={cities.data}
          currentCity={city}
          seasonSelected={Boolean(season)}
        />
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
          city={city}
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
