import {
  DEFAULT_CITY_NAME,
  DEFAULT_CITY_SLUG,
  DEFAULT_CITY_TIMEZONE,
} from "@/constants/nav";
import { useAPI } from "@/hooks/use-api";
import { cityDate } from "@/lib/events/event-list";
import type { CitySummary } from "@/requests/get-cities";
import type { Events } from "@/requests/helpers/types";

/** Today's date and event count for a city, in the city's own time zone. */
export const useCalendarToday = ({ city }: { city?: CitySummary } = {}) => {
  const timezone = city?.timezone ?? DEFAULT_CITY_TIMEZONE;
  const date = cityDate(new Date(), timezone);
  const params = new URLSearchParams({
    city: city?.slug ?? DEFAULT_CITY_SLUG,
    date,
    limit: "1",
  });

  const { data } = useAPI<Pick<Events, "totalDocs">>(
    `/api/public/events?${params}`,
  );
  const totalEvents = data?.totalDocs;

  return {
    totalEvents,
    cityName: city?.name ?? DEFAULT_CITY_NAME,
    /** Today as YYYY-MM-DD in the city's time zone. */
    date,
    timezone,
  };
};
