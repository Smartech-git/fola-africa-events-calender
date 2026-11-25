import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  PayloadRequest,
} from "payload";

import { relationID } from "@/payload/validation";
import type { Event } from "@/payload-types";

/**
 * Recounts a member's submitted happenings. Written straight to the database:
 * a count is not a profile change, so it skips the members' hooks (Brevo sync,
 * subscriber merge).
 */
async function recount(req: PayloadRequest, memberId: number | string) {
  const { totalDocs } = await req.payload.count({
    collection: "events",
    where: { member: { equals: memberId } },
    overrideAccess: true,
    req,
  });
  await req.payload.db.updateOne({
    collection: "members",
    id: memberId,
    data: { happeningsSubmitted: totalDocs },
    req,
    returning: false,
  });
}

async function recountAll(req: PayloadRequest, ids: unknown[]) {
  const members = new Set(ids.map(relationID).filter((id) => id !== undefined));
  for (const id of members) {
    try {
      await recount(req, id);
    } catch (error) {
      // The member may have been deleted; the count is never worth failing a save.
      req.payload.logger.warn(
        { err: error, member: id },
        "Member happening count not updated",
      );
    }
  }
}

/** Keeps members.happeningsSubmitted in step when an event's member is set or changed. */
export const countMemberHappenings: CollectionAfterChangeHook<Event> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const now = relationID(doc.member);
  const before =
    operation === "update" ? relationID(previousDoc?.member) : undefined;
  if (now !== before) await recountAll(req, [now, before]);
  return doc;
};

export const uncountMemberHappening: CollectionAfterDeleteHook<Event> = async ({
  doc,
  req,
}) => {
  await recountAll(req, [doc.member]);
};
