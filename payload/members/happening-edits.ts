import "server-only";

import { createLocalReq, type Payload } from "payload";

import { PRIVATE_ACCESS, PRIVATE_SUBMITTERS } from "@/payload/constants";
import {
  changedFields,
  eventData,
  fieldLabel,
  happeningValues,
  MEMBER_STATUS_CHANGE,
  queueChangesSubmittedEmails,
  queueResubmittedEmails,
  queueStatusChangeEmails,
  type HappeningValues,
} from "@/payload/members/happening-changes";
import { getCalendarPayload } from "@/payload/queries/calendar-query";
import { checkSubmittedArtwork } from "@/payload/submissions/artwork";
import { relationID } from "@/payload/validation";
import type { City, Event, EventChange, Member } from "@/payload-types";
import {
  editHappeningSchema,
  type EditHappeningValues,
} from "@/validations/happening-edit";

/**
 * How a member may change a happening:
 * - "direct": still in review, so edits update the submission itself. A
 *   happening that wasn't approved is edited the same way and goes back for
 *   review when saved;
 * - "request": approved or live, so edits wait in a change request and the
 *   live listing stays as it is until an administrator approves;
 * - "locked": withdrawn, cancelled or over.
 */
export type EditMode = "direct" | "request" | "locked";

export interface EditResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof EditHappeningValues, string[]>>;
  /** Labels of the fields that changed. */
  changed?: string[];
}

const trusted = { overrideAccess: true } as const;
const fail = (error: string, fieldErrors?: EditResult["fieldErrors"]) =>
  ({ ok: false, error, fieldErrors }) satisfies EditResult;

const ended = (event: Event) =>
  Date.parse(event.endAt ?? event.startAt) < Date.now();

export function editMode(event: Event): EditMode {
  if (event.status === "submitted") return "direct";
  if (event.status === "rejected" && !ended(event)) return "direct";
  if (
    ["approved", "published", "postponed"].includes(event.status) &&
    !ended(event)
  )
    return "request";
  return "locked";
}

async function pendingChangeFor(payload: Payload, eventId: number) {
  const result = await payload.find({
    collection: "event-changes",
    where: {
      and: [{ event: { equals: eventId } }, { status: { equals: "pending" } }],
    },
    limit: 1,
    depth: 0,
    ...trusted,
  });
  return result.docs[0] ?? null;
}

/** The member's own happening, ready for the edit page; null if it isn't theirs. */
export async function loadEditableHappening(memberId: number, eventId: number) {
  const payload = await getCalendarPayload();
  const event = await payload.findByID({
    collection: "events",
    id: eventId,
    depth: 1,
    disableErrors: true,
    ...trusted,
  });
  if (!event || relationID(event.member) !== memberId) return null;
  const pending = await pendingChangeFor(payload, event.id);
  const live = happeningValues(event);
  // Pending changes are shown in place, so the member continues from them.
  const values: HappeningValues = {
    ...live,
    ...((pending?.changes ?? {}) as Partial<HappeningValues>),
  };
  return {
    event,
    city: event.city as City,
    mode: editMode(event),
    pending,
    live,
    values,
  };
}

const pick = (values: HappeningValues, names: string[]) =>
  Object.fromEntries(
    names.map((name) => [name, values[name as keyof HappeningValues]]),
  ) as Partial<HappeningValues>;

/** Saves the member's edits: straight onto a submission, or as a change request. */
export async function saveHappeningEdits(
  member: Member,
  eventId: number,
  input: unknown,
): Promise<EditResult> {
  const parsed = editHappeningSchema.safeParse(input);
  if (!parsed.success)
    return fail(
      "Please check the highlighted fields.",
      parsed.error.flatten().fieldErrors,
    );
  const loaded = await loadEditableHappening(member.id, eventId);
  if (!loaded) return fail("This happening isn’t in your account.");
  const { event, city, mode, pending, live } = loaded;
  if (mode === "locked")
    return fail("This happening can no longer be changed here.");

  const { note, artworkRights, ...next } = parsed.data;
  if (
    PRIVATE_ACCESS.includes(next.access) &&
    !PRIVATE_SUBMITTERS.includes(event.submittedBy?.relationship ?? "")
  )
    return fail("Check who can attend.", {
      access: [
        "Only the organiser, the company or brand, or their agency or PR may list a private event.",
      ],
    });
  const payload = await getCalendarPayload();
  if (next.artwork && next.artwork !== live.artwork) {
    const problem = await checkSubmittedArtwork(
      payload,
      Number(next.artwork),
      member.id,
    );
    if (problem) return fail(problem, { artwork: [problem] });
    if (!artworkRights)
      return fail("Confirm that you have the right to share this artwork.", {
        artworkRights: [
          "Confirm that you have the right to share this artwork.",
        ],
      });
  }
  const changed = changedFields(live, next);
  let data: Record<string, unknown>;
  try {
    data = eventData(pick(next, changed), city.timezone, {
      submission: mode === "direct",
    });
  } catch {
    return fail("Check the dates and times.", {
      startAt: ["Check the dates and times in this city’s time zone."],
    });
  }

  if (mode === "direct") {
    if (!changed.length) return fail("Nothing has changed yet.");
    // Fixing a happening that wasn't approved sends it back for review.
    const resubmitting = event.status === "rejected";
    const req = await createLocalReq({}, payload);
    try {
      await payload.update({
        collection: "events",
        id: event.id,
        depth: 0,
        ...trusted,
        req,
        // Never save over a reviewer who has the submission open.
        overrideLock: false,
        data: {
          ...data,
          ...(resubmitting && { status: "submitted" }),
          submitterEditedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof Error && /lock/i.test(error.message))
        return fail(
          "The Happenings team is reviewing this right now. Try again in a few minutes.",
        );
      throw error;
    }
    if (data.artwork)
      await payload.update({
        collection: "media",
        id: data.artwork as number,
        depth: 0,
        ...trusted,
        data: { alt: `Artwork for ${next.title}` },
      });
    if (resubmitting) {
      const review = await reopenReview(payload, event.id);
      await queueResubmittedEmails(
        req,
        { ...event, title: next.title },
        member,
        { changes: pick(next, changed), previous: pick(live, changed) },
        review?.id,
      );
    }
    return { ok: true, changed: changed.map(fieldLabel) };
  }

  // A live listing: the change request holds the edits until approved.
  if (!changed.length) {
    if (pending) await discardPendingChange(payload, pending);
    return pending
      ? { ok: true, changed: [] }
      : fail("Nothing has changed yet.");
  }
  const request = {
    summary: changed.map(fieldLabel).join(", "),
    changes: pick(next, changed),
    previous: pick(live, changed),
    note: note || null,
  };
  if (pending) {
    await payload.update({
      collection: "event-changes",
      id: pending.id,
      depth: 0,
      ...trusted,
      data: request,
    });
  } else {
    const req = await createLocalReq({}, payload);
    const created = await payload.create({
      collection: "event-changes",
      depth: 0,
      ...trusted,
      req,
      data: {
        ...request,
        event: event.id,
        member: member.id,
        status: "pending",
      },
    });
    await queueChangesSubmittedEmails(req, event, created, member);
  }
  return { ok: true, changed: changed.map(fieldLabel) };
}

/** Puts the latest Event Review back in the queue; its earlier decision stays in its versions. */
async function reopenReview(payload: Payload, eventId: number) {
  const { docs } = await payload.find({
    collection: "event-reviews",
    where: { event: { equals: eventId } },
    sort: "-createdAt",
    limit: 1,
    depth: 0,
    ...trusted,
  });
  if (!docs[0]) return undefined;
  return payload.update({
    collection: "event-reviews",
    id: docs[0].id,
    depth: 0,
    ...trusted,
    data: { humanDecision: "pending", decidedBy: null, decidedAt: null },
  });
}

async function discardPendingChange(payload: Payload, pending: EventChange) {
  await payload.update({
    collection: "event-changes",
    id: pending.id,
    depth: 0,
    ...trusted,
    data: { status: "withdrawn" },
  });
}

/** Throws away changes waiting for approval; the live listing is untouched. */
export async function discardHappeningChanges(member: Member, eventId: number) {
  const loaded = await loadEditableHappening(member.id, eventId);
  if (!loaded?.pending) return fail("There are no changes waiting.");
  await discardPendingChange(await getCalendarPayload(), loaded.pending);
  return { ok: true };
}

/** Takes a submission back before it is approved. It never appears publicly. */
export async function withdrawHappening(member: Member, eventId: number) {
  const loaded = await loadEditableHappening(member.id, eventId);
  if (!loaded || loaded.event.status !== "submitted")
    return fail("Only a happening still in review can be withdrawn.");
  const payload = await getCalendarPayload();
  await payload.update({
    collection: "events",
    id: eventId,
    depth: 0,
    ...trusted,
    data: { status: "withdrawn" },
    context: { [MEMBER_STATUS_CHANGE]: { memberId: member.id } },
  });
  return { ok: true };
}

/**
 * Cancels or postpones the member's own live happening at once (option a).
 * The listing stays visible with its state; the team and the member are emailed.
 */
export async function changeHappeningStatus(
  member: Member,
  eventId: number,
  status: "cancelled" | "postponed",
  note: string,
) {
  const loaded = await loadEditableHappening(member.id, eventId);
  if (!loaded) return fail("This happening isn’t in your account.");
  const { event, pending } = loaded;
  const allowed =
    !ended(event) &&
    (event.status === "published" ||
      (status === "cancelled" && event.status === "postponed"));
  if (!allowed)
    return fail(
      status === "cancelled"
        ? "Only a live or postponed happening can be cancelled."
        : "Only a live happening can be postponed.",
    );
  const payload = await getCalendarPayload();
  const req = await createLocalReq({}, payload);
  await payload.update({
    collection: "events",
    id: eventId,
    depth: 0,
    ...trusted,
    req,
    data: { status },
    context: { [MEMBER_STATUS_CHANGE]: { memberId: member.id } },
  });
  // A cancelled happening has nothing left to change.
  if (status === "cancelled" && pending)
    await discardPendingChange(payload, pending);
  await queueStatusChangeEmails(req, event, member, status, note.trim());
  return { ok: true };
}
