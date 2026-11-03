import {
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionAfterChangeHook,
  type CollectionBeforeDeleteHook,
} from "payload";

import { roleOf } from "@/payload/access";
import {
  PRIVATE_ACCESS,
  PRIVATE_SUBMITTERS,
  PUBLIC_STATUSES,
} from "@/payload/constants";
import {
  APPLYING_CHANGE_REQUEST,
  MEMBER_STATUS_CHANGE,
} from "@/payload/members/happening-changes";
import {
  editorialChange,
  eventSnapshot,
} from "@/payload/reviews/event-snapshot";
import { SENDING_REVIEW_DECISION } from "@/payload/reviews/review-decision";
import { approveSubmissionRelations } from "@/payload/submissions/approve-submission-relations";
import { eventProblems, relationID } from "@/payload/validation";
import type { Event } from "@/payload-types";

export const deleteEventReviews: CollectionBeforeDeleteHook = async ({
  id,
  req,
}) => {
  // The parent deletion has already passed access control. Share its transaction
  // so review/version cleanup rolls back if deleting the event fails.
  const result = await req.payload.delete({
    collection: "event-reviews",
    where: { event: { equals: id } },
    req,
    overrideAccess: true,
    depth: 0,
  });
  if (result.errors.length) {
    throw new APIError(
      "Unable to delete the event's linked reviews. Please try again.",
      409,
    );
  }
  // Members' change requests belong to the event too.
  const changes = await req.payload.delete({
    collection: "event-changes",
    where: { event: { equals: id } },
    req,
    overrideAccess: true,
    depth: 0,
  });
  if (changes.errors.length)
    throw new APIError(
      "Unable to delete the event's change requests. Please try again.",
      409,
    );
};

// What a member may do to their own happening without staff (option a).
const MEMBER_TRANSITIONS: Record<string, string[]> = {
  submitted: ["withdrawn"],
  published: ["cancelled", "postponed"],
  postponed: ["cancelled"],
};

export const validateEvent: CollectionBeforeChangeHook = async ({
  data,
  originalDoc: previous,
  operation,
  req,
  context,
}) => {
  const originalDoc = operation === "update" ? previous : undefined;
  const event = { ...originalDoc, ...data };

  // A member cancelling, postponing or withdrawing their own happening. Only
  // the status may change, and only along MEMBER_TRANSITIONS; staff undo it.
  const memberChange = context[MEMBER_STATUS_CHANGE] as
    { memberId: number } | undefined;
  if (memberChange) {
    if (
      !originalDoc ||
      relationID(originalDoc.member) !== memberChange.memberId ||
      editorialChange(originalDoc, event) ||
      !MEMBER_TRANSITIONS[originalDoc.status]?.includes(data.status)
    )
      throw new APIError("This happening can’t be changed that way.", 403);
    return data;
  }
  const applyingChange = Boolean(context[APPLYING_CHANGE_REQUEST]);
  for (const key of ["submittedOrganiser", "submittedVenue"]) {
    if (data[key] && typeof data[key] === "object")
      event[key] = { ...originalDoc?.[key], ...data[key] };
  }
  // A real submission always has its AI review from when it was received, so
  // one without a review was marked by hand and may be switched back.
  if (originalDoc?.source === "submission" && event.source !== "submission") {
    const { totalDocs: reviews } = await req.payload.count({
      collection: "event-reviews",
      where: { event: { equals: originalDoc.id } },
      req,
    });
    if (reviews)
      throw new APIError(
        "A public submission's source cannot be changed.",
        400,
      );
  }
  if (
    event.source === "submission" &&
    originalDoc?.source !== "submission" &&
    req.user?.collection === "users"
  )
    throw new APIError(
      "Only the website's submission form can mark an event as a public submission. Keep it as a FOLA entry; assigning a member doesn't need it.",
      400,
    );
  if (
    event.source === "submission" &&
    (!originalDoc ||
      originalDoc.submittedOrganiser?.name ||
      event.submittedOrganiser?.name) &&
    (!event.submittedOrganiser?.name ||
      !event.submittedOrganiser?.type ||
      !event.submittedOrganiser?.contactEmail)
  )
    throw new APIError(
      "Public submissions require the submitted organiser's name, type and contact email.",
      400,
    );
  if (
    !event.organiser &&
    !(event.source === "submission" && event.submittedOrganiser?.name)
  )
    throw new APIError("Select an organiser for this event.", 400);
  const errors = eventProblems(event);
  if (errors.length) throw new APIError(errors.join(" "), 400);
  // An approved change request is itself the review, so it keeps the listing up.
  const changed =
    originalDoc && !applyingChange && editorialChange(originalDoc, event);
  if (applyingChange) {
    data.approvedBy = req.user!.id;
    data.approvedAt = new Date().toISOString();
  }
  for (const key of ["startAt", "endAt"]) {
    if (event[key]) data[key] = new Date(event[key]).toISOString();
  }
  const city = relationID(event.city);
  if (event.venue) {
    const venue = await req.payload.findByID({
      collection: "venues",
      id: relationID(event.venue)!,
      depth: 0,
      req,
    });
    if (String(relationID(venue.city)) !== String(city))
      throw new APIError("Venue must belong to the event's city.", 400);
  }
  for (const value of event.seasons || []) {
    const season = await req.payload.findByID({
      collection: "seasons",
      id: relationID(value)!,
      depth: 0,
      req,
    });
    if (String(relationID(season.city)) !== String(city))
      throw new APIError("Every season must belong to the event's city.", 400);
  }
  if (
    event.source === "submission" &&
    (!event.submittedBy?.name ||
      !event.submittedBy?.email ||
      !event.submittedBy?.relationship)
  ) {
    throw new APIError(
      "Public submissions require the submitter's name, email and relationship to the event.",
      400,
    );
  }
  if (
    event.source === "submission" &&
    PRIVATE_ACCESS.includes(event.access) &&
    !PRIVATE_SUBMITTERS.includes(event.submittedBy?.relationship)
  ) {
    throw new APIError(
      "Private and invitation-only submissions must come from the organiser, the company or brand, or their agency or PR.",
      400,
    );
  }
  const administrator = roleOf(req.user) === "admin";
  const approver = administrator || roleOf(req.user) === "approver";
  if (
    data.status === "rejected" &&
    originalDoc?.status !== "rejected" &&
    !context[SENDING_REVIEW_DECISION]
  )
    throw new APIError(
      "Reject a submission from its Event Review, which emails the submitter.",
      400,
    );

  // Content edits invalidate approval and require a new review, including
  // edits by an approver. An administrator can publish directly, so their own
  // edit is the new approval and keeps the status they chose.
  if (changed && administrator && data.status !== "submitted") {
    data.approvedBy = req.user!.id;
    data.approvedAt = new Date().toISOString();
  } else if (changed) {
    data.status = "submitted";
    data.approvedBy = null;
    data.approvedAt = null;
    data.verified = false;
    data.organiserConfirmed = false;
    data.organiserConfirmedBy = null;
    data.organiserConfirmedAt = null;
  }
  const nextStatus = data.status || event.status || "submitted";
  if (event.isDemo && nextStatus !== "submitted")
    throw new APIError(
      "Demo events must remain unpublished and submitted.",
      400,
    );
  if (!originalDoc && nextStatus !== "submitted" && !administrator)
    throw new APIError(
      "New events must enter the review queue as Submitted.",
      400,
    );
  // A postponed happening returning with its new date was approved before.
  const returningFromPostponement =
    applyingChange &&
    originalDoc?.status === "postponed" &&
    nextStatus === "published";
  if (
    nextStatus !== "submitted" &&
    nextStatus !== originalDoc?.status &&
    !returningFromPostponement
  ) {
    if (
      event.source === "submission" &&
      ["approved", "published"].includes(nextStatus) &&
      !administrator
    )
      throw new APIError(
        "An administrator must approve or publish public submissions.",
        403,
      );
    if (!approver)
      throw new APIError(
        "A FOLA approver must make publication decisions.",
        403,
      );
    if (
      nextStatus === "approved" ||
      (event.source === "submission" && nextStatus === "published") ||
      (administrator &&
        nextStatus === "published" &&
        originalDoc?.status !== "approved")
    ) {
      if (PRIVATE_ACCESS.includes(event.access) && !event.organiserConfirmed)
        throw new APIError(
          "Confirm private listings directly with the organiser before approval.",
          400,
        );
      // Website submissions are reviewed by AI once, when received. Later
      // edits need human reapproval but not another AI review.
      if (event.source === "submission") {
        if (!originalDoc)
          throw new APIError(
            "Submit this event for AI review before approval or publication.",
            400,
          );
        const reviews = await req.payload.find({
          collection: "event-reviews",
          where: { event: { equals: originalDoc.id } },
          sort: "-createdAt",
          limit: 1,
          depth: 0,
          req,
        });
        const review = reviews.docs[0];
        if (
          !review ||
          review.aiStatus !== "completed" ||
          (!administrator &&
            !["accepted", "amended"].includes(review.humanDecision || ""))
        )
          throw new APIError(
            "Complete the AI review before approval or publication.",
            400,
          );
        Object.assign(
          data,
          await approveSubmissionRelations(event as Event, req),
        );
        if (!["accepted", "amended"].includes(review.humanDecision || ""))
          await req.payload.update({
            collection: "event-reviews",
            id: review.id,
            req,
            depth: 0,
            data: { humanDecision: "accepted" },
          });
      }
      data.approvedBy =
        originalDoc?.status === "approved"
          ? originalDoc.approvedBy
          : req.user!.id;
      data.approvedAt =
        originalDoc?.status === "approved"
          ? originalDoc.approvedAt
          : new Date().toISOString();
    }
    if (
      nextStatus === "published" &&
      !administrator &&
      originalDoc?.status !== "approved"
    ) {
      throw new APIError("Only an approved event can be published.", 400);
    } else if (
      ["cancelled", "postponed"].includes(nextStatus) &&
      !originalDoc?.publishedAt
    ) {
      throw new APIError(
        "Only a previously published event can be cancelled or postponed.",
        400,
      );
    }
    if (nextStatus === "published")
      data.publishedAt = originalDoc?.publishedAt || new Date().toISOString();
  }
  if (
    !changed &&
    data.organiserConfirmed === true &&
    !originalDoc?.organiserConfirmed
  ) {
    if (!approver)
      throw new APIError(
        "An approver must record organiser confirmation.",
        403,
      );
    data.organiserConfirmedBy = req.user!.id;
    data.organiserConfirmedAt = new Date().toISOString();
  }
  if (event.isDemo) data.verified = false;
  if (
    ["approved", ...PUBLIC_STATUSES].includes(nextStatus) &&
    !relationID(data.organiser ?? event.organiser)
  )
    throw new APIError("Approval requires an organiser record.", 400);
  if (
    PUBLIC_STATUSES.includes(nextStatus) &&
    !originalDoc?.approvedBy &&
    !data.approvedBy
  )
    throw new APIError("Publication requires a recorded human approval.", 400);
  return data;
};

export const queueEventReview: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  // AI reviews each website submission once, when it is received. Staff
  // entries and later edits follow the manual approval path.
  if (
    operation !== "create" ||
    doc.source !== "submission" ||
    doc.status !== "submitted"
  )
    return doc;
  const originalListing = eventSnapshot(doc);
  await req.payload.create({
    collection: "event-reviews",
    req,
    depth: 0,
    data: {
      event: doc.id,
      aiStatus: "pending",
      humanDecision: "pending",
      originalListing,
    },
  });
  return doc;
};
