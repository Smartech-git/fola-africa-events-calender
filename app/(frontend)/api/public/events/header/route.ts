import {
  calendarError,
  getCalendarPayload,
  queryEventsHeader,
} from "@/payload/queries/calendar-query";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const payload = await getCalendarPayload();
    return Response.json(
      await queryEventsHeader(payload, new URL(request.url).searchParams),
    );
  } catch (error) {
    return calendarError(error);
  }
}
