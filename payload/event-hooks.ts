import {
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionAfterChangeHook,
} from "payload";

import { roleOf } from "@/payload/access";
import { PRIVATE_ACCESS, PUBLIC_STATUSES } from "@/payload/constants";
import { eventProblems, relationID } from "@/payload/validation";

const editorialFields = [
  "title",
  "city",
  "startAt",
  "endAt",
  "allDay",
  "industry",
  "secondaryIndustry",
  "eventType",
  "access",
  "visibility",
  "actionUrl",
  "organiser",
  "venue",
  "seasons",
  "description",
];

export const validateEvent: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const event = { ...originalDoc, ...data };
  const errors = eventProblems(event);
  if (errors.length) throw new APIError(errors.join(" "), 400);
  const changed =
    originalDoc &&
    editorialFields.some(
      (key) =>
        key in data &&
        JSON.stringify(data[key]) !== JSON.stringify(originalDoc[key]),
    );
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
    !["organiser", "pr"].includes(event.submittedBy?.relationship)
  ) {
    throw new APIError(
      "Private and invitation-only submissions must come from an organiser or their representative.",
      400,
    );
  }
  const approver = ["admin", "approver"].includes(roleOf(req.user) || "");

  // Content edits invalidate approval and require a new review, including edits by an approver.
  if (changed) {
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
  if (!originalDoc && nextStatus !== "submitted")
    throw new APIError(
      "New events must enter the review queue as Submitted.",
      400,
    );
  if (nextStatus !== "submitted" && nextStatus !== originalDoc?.status) {
    if (!approver)
      throw new APIError(
        "A FOLA approver must make publication decisions.",
        403,
      );
    if (nextStatus === "approved") {
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
        !["accepted", "amended"].includes(review.humanDecision || "")
      )
        throw new APIError(
          "Complete the AI review and human recommendation before approval.",
          400,
        );
      if (PRIVATE_ACCESS.includes(event.access) && !event.organiserConfirmed)
        throw new APIError(
          "Confirm private listings directly with the organiser before approval.",
          400,
        );
      data.approvedBy = req.user!.id;
      data.approvedAt = new Date().toISOString();
    } else if (
      nextStatus === "published" &&
      originalDoc.status !== "approved"
    ) {
      throw new APIError("Only an approved event can be published.", 400);
    } else if (
      ["cancelled", "postponed"].includes(nextStatus) &&
      !originalDoc.publishedAt
    ) {
      throw new APIError(
        "Only a previously published event can be cancelled or postponed.",
        400,
      );
    }
    if (nextStatus === "published")
      data.publishedAt = originalDoc.publishedAt || new Date().toISOString();
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
    PUBLIC_STATUSES.includes(nextStatus) &&
    !originalDoc?.approvedBy &&
    !data.approvedBy
  )
    throw new APIError("Publication requires a recorded human approval.", 400);
  return data;
};

export const queueEventReview: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const changed =
    operation === "create" ||
    editorialFields.some(
      (key) => JSON.stringify(doc[key]) !== JSON.stringify(previousDoc?.[key]),
    );
  if (doc.status !== "submitted" || !changed) return doc;
  const originalListing = Object.fromEntries(
    editorialFields.map((key) => [key, doc[key] ?? null]),
  );
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
