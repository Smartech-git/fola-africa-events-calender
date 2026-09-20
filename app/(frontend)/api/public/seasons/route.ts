import {
  calendarError,
  getCalendarPayload,
  querySeasonsByCity,
} from "@/payload/queries/calendar-query";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const payload = await getCalendarPayload();
    return Response.json(
      await querySeasonsByCity(payload, new URL(request.url).searchParams),
    );
  } catch (error) {
    return calendarError(error);
  }
}
