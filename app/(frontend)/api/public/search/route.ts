import { DEFAULT_CITY_SLUG } from "@/constants/nav";
import { getSiteCity } from "@/lib/site-city";
import {
  calendarError,
  getCalendarPayload,
  querySearch,
} from "@/payload/queries/calendar-query";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    // Without a city, search the visitor's chosen city.
    if (!params.get("city")?.trim())
      params.set("city", (await getSiteCity({})) || DEFAULT_CITY_SLUG);
    const payload = await getCalendarPayload();
    return Response.json(await querySearch(payload, params));
  } catch (error) {
    return calendarError(error);
  }
}
