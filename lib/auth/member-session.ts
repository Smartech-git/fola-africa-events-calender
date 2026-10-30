import "server-only";

import { cache } from "react";

import { clearCookies, createCookies, getCookies } from "@/lib/cookies";
import { getCalendarPayload } from "@/payload/queries/calendar-query";
import type { Member } from "@/payload-types";

interface MemberCookie {
  memberId: number;
  /** The member's sessionVersion when this session started. */
  version: number;
}

/** Signs the member in on this browser for 30 days. Server actions and route handlers only. */
export async function startMemberSession(
  member: Pick<Member, "id" | "sessionVersion">,
) {
  await createCookies<MemberCookie>({
    cookie: { memberId: member.id, version: member.sessionVersion ?? 0 },
  });
}

export async function endMemberSession() {
  await clearCookies();
}

/**
 * The signed-in member for this request, or null. A session ends when it
 * expires, when the member is suspended, or when "Sign out of all devices"
 * raises their sessionVersion.
 */
export const getMember = cache(async (): Promise<Member | null> => {
  const session = await getCookies<MemberCookie>();
  const memberId = session?.cookie?.memberId;
  if (!session || typeof memberId !== "number" || !Number.isInteger(memberId))
    return null;
  const payload = await getCalendarPayload();
  const member = await payload.findByID({
    collection: "members",
    id: memberId,
    depth: 0,
    // Members are never Payload users; only this server code reads their record.
    overrideAccess: true,
    disableErrors: true,
    joins: false,
  });
  if (
    !member ||
    member.status !== "active" ||
    (member.sessionVersion ?? 0) !== session.cookie.version
  )
    return null;
  return member;
});
