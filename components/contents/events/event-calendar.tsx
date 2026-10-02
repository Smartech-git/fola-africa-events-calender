import EventList from "@/components/contents/events/event-list";
import EventMonth from "@/components/contents/events/event-month";
import EventWeek from "@/components/contents/events/event-week";
import FilterMenu from "@/components/contents/events/filter-menu";
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
      <FilterMenu
        cities={cities.data}
        currentCity={city}
        seasonSelected={Boolean(season)}
        defaultDateFrom={calendar.defaultDateFrom}
        defaultDateTo={calendar.defaultDateTo}
      />
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
          query={calendar.query}
          initialEvents={calendar.events}
          initialError={calendar.initialError}
        />
      )}
    </>
  );
}
