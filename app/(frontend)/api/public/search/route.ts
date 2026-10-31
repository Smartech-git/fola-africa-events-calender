import { cookies } from "next/headers";

import { FILTER_KEYS } from "@/constants/filters";
import { DEFAULT_CITY_SLUG } from "@/constants/nav";
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
      params.set(
        "city",
        (await cookies()).get(FILTER_KEYS.siteCity)?.value || DEFAULT_CITY_SLUG,
      );
    const payload = await getCalendarPayload();
    return Response.json(await querySearch(payload, params));
  } catch (error) {
    return calendarError(error);
  }
}
