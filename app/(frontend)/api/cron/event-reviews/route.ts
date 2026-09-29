import { timingSafeEqual } from "node:crypto";

import { runReviews } from "@/payload/reviews/run-reviews";

export const runtime = "nodejs";
export const maxDuration = 240;

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
    const result = await runReviews(3);
    return Response.json(result, { status: result.configured ? 200 : 503 });
  } catch {
    return Response.json(
      { error: "Review runner unavailable." },
      { status: 503 },
    );
  }
}
