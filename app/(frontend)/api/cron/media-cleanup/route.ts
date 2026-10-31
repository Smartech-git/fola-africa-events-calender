import { timingSafeEqual } from "node:crypto";

import { getCalendarPayload } from "@/payload/queries/calendar-query";
import { deleteUnusedUploads } from "@/payload/submissions/artwork";

export const runtime = "nodejs";
export const maxDuration = 240;

/** Daily: deletes artwork uploads from abandoned submission forms. */
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET
    ? `Bearer ${process.env.CRON_SECRET}`
    : "";
  const actual = request.headers.get("authorization") || "";
  if (
    !expected ||
    Buffer.byteLength(actual) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  )
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return Response.json(await deleteUnusedUploads(await getCalendarPayload()));
  } catch (error) {
    console.error("Media cleanup failed", error);
    return Response.json({ error: "Media cleanup failed." }, { status: 503 });
  }
}
