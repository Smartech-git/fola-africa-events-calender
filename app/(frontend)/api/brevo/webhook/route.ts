import { timingSafeEqual } from "node:crypto";

import { SKIP_BREVO_SYNC } from "@/payload/members/brevo-task";
import { getCalendarPayload } from "@/payload/queries/calendar-query";

export const runtime = "nodejs";

// Marketing events that mean "stop emailing me".
const OPT_OUT_EVENTS = ["unsubscribed", "spam"];

function authorised(request: Request) {
  const secret = process.env.BREVO_WEBHOOK_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization")?.replace(/^Bearer /, "");
  const given = header || new URL(request.url).searchParams.get("token") || "";
  return (
    Buffer.byteLength(given) === Buffer.byteLength(secret) &&
    timingSafeEqual(Buffer.from(given), Buffer.from(secret))
  );
}

/**
 * POST /api/brevo/webhook: Brevo's marketing webhook. When someone unsubscribes
 * (or marks an email as spam) in Brevo, their Happenings profile shows
 * marketing as off, so a later sync never adds them back.
 */
export async function POST(request: Request) {
  if (!authorised(request))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  // Brevo may send one event or a batch.
  const events = (Array.isArray(body) ? body : [body]).filter(
    (event): event is { event: string; email: string } =>
      Boolean(event) &&
      typeof event === "object" &&
      typeof event.event === "string" &&
      typeof event.email === "string",
  );
  const emails = [
    ...new Set(
      events
        .filter(({ event }) => OPT_OUT_EVENTS.includes(event))
        .map(({ email }) => email.trim().toLowerCase()),
    ),
  ];
  if (!emails.length) return Response.json({ updated: 0 });

  const payload = await getCalendarPayload();
  const result = await payload.update({
    collection: "members",
    where: {
      and: [{ email: { in: emails } }, { marketingConsent: { equals: true } }],
    },
    data: { marketingConsent: false, marketingConsentAt: null },
    depth: 0,
    overrideAccess: true,
    context: { [SKIP_BREVO_SYNC]: true },
  });
  // Always 200 for a valid request, so Brevo does not retry unknown addresses.
  return Response.json({ updated: result.docs.length });
}
