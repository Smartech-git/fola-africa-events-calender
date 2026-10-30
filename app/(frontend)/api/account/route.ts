import { endMemberSession, getMember } from "@/lib/auth/member-session";
import {
  getMemberHappenings,
  happeningCounts,
} from "@/payload/members/member-happenings";

export const dynamic = "force-dynamic";

export interface AccountSummary {
  signedIn: boolean;
  name?: string;
  organisation?: string | null;
  pending?: number;
}

/** Who is signed in, for the header and mobile menu. Only the member's own details. */
export async function GET() {
  const member = await getMember();
  if (!member) {
    // A revoked or suspended session: clear the cookies so the header updates.
    await endMemberSession();
    return Response.json({ signedIn: false } satisfies AccountSummary, {
      headers: { "Cache-Control": "no-store" },
    });
  }
  const counts = happeningCounts(await getMemberHappenings(member.id));
  return Response.json(
    {
      signedIn: true,
      name: member.fullName,
      organisation: member.organisation,
      pending: counts.pending,
    } satisfies AccountSummary,
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
