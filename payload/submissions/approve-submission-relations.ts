import { randomUUID } from "node:crypto";

import { APIError, type PayloadRequest } from "payload";

import { formatSlug } from "@/payload/fields/format-slug";
import { parseRelationUpdate } from "@/payload/submissions/relation-update";
import { relationID } from "@/payload/validation";
import type { Event } from "@/payload-types";

async function createSlug(
  collection: "organisers" | "venues",
  name: string,
  req: PayloadRequest,
  citySlug?: string,
) {
  const base = formatSlug(name);
  if (!base)
    throw new APIError(
      "Include letters or numbers in the submitted name.",
      400,
    );
  const exists = async (slug: string) =>
    (
      await req.payload.count({
        collection,
        where: { slug: { equals: slug } },
        req,
        overrideAccess: true,
      })
    ).totalDocs > 0;
  if (!(await exists(base))) return base;
  const scoped = citySlug ? `${base}-${citySlug}` : base;
  if (scoped !== base && !(await exists(scoped))) return scoped;
  return `${scoped}-${randomUUID()}`;
}

async function preventDuplicate(
  collection: "organisers" | "venues",
  name: string,
  req: PayloadRequest,
  city?: string | number,
) {
  const result = await req.payload.find({
    collection,
    req,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    where: {
      and: [
        { isDemo: { not_equals: true } },
        {
          or: [
            { slug: { equals: formatSlug(name) } },
            { name: { like: name } },
          ],
        },
        ...(city ? [{ city: { equals: city } }] : []),
      ],
    },
  });
  if (result.docs.some((item) => formatSlug(item.name) === formatSlug(name)))
    throw new APIError(
      `A matching ${collection === "organisers" ? "organiser" : "venue in this city"} already exists. Select the existing record, or distinguish the submitted name before creating a new one.`,
      400,
    );
}

/** Runs only after completed AI review and an administrator's approval. */
export async function approveSubmissionRelations(
  event: Event,
  req: PayloadRequest,
) {
  const submitted = event.submittedOrganiser;
  if (!submitted?.name) return {};
  const result: Partial<Event> = {};
  if (
    ["use-existing", "update-existing"].includes(
      event.organiserResolution || "",
    )
  ) {
    const id = relationID(event.organiser);
    if (!id)
      throw new APIError("Select an existing organiser before approval.", 400);
    const organiser = await req.payload.findByID({
      collection: "organisers",
      id,
      depth: 0,
      req,
    });
    if (organiser.isDemo)
      throw new APIError(
        "Demo organisers cannot be used for public submissions.",
        400,
      );
    result.organiser = organiser.id;
    if (event.organiserResolution === "update-existing") {
      const plan = parseRelationUpdate(event.organiserUpdate, "organiser");
      if (!plan || String(plan.recordId) !== String(id))
        throw new APIError(
          "Select the organiser and fields to update in the update modal before approval.",
          400,
        );
      const changes: Record<string, unknown> = {};
      for (const field of plan.fields) {
        if (field === "contactEmail") {
          changes.contact = {
            ...organiser.contact,
            email: submitted.contactEmail,
          };
        } else {
          changes[field] = submitted[field as keyof typeof submitted] ?? null;
        }
      }
      await req.payload.update({
        collection: "organisers",
        id: organiser.id,
        req,
        depth: 0,
        data: changes,
      });
      result.organiserResolution = "use-existing";
      result.organiserUpdate = null;
    }
  } else if (event.organiserResolution === "create-new") {
    if (!submitted.type || !submitted.contactEmail)
      throw new APIError(
        "Complete the submitted organiser type and contact email before approval.",
        400,
      );
    await preventDuplicate("organisers", submitted.name, req);
    const organiser = await req.payload.create({
      collection: "organisers",
      req,
      depth: 0,
      overrideAccess: true,
      data: {
        name: submitted.name,
        type: submitted.type,
        slug: await createSlug("organisers", submitted.name, req),
        website: submitted.website,
        contact: { email: submitted.contactEmail },
        isDemo: false,
      },
    });
    result.organiser = organiser.id;
    result.organiserResolution = "use-existing";
  } else {
    throw new APIError(
      "Choose whether to use or update an existing organiser, or create one on approval.",
      400,
    );
  }

  if (event.submittedVenue?.name) {
    const city = relationID(event.city)!;
    if (
      ["use-existing", "update-existing"].includes(event.venueResolution || "")
    ) {
      const id = relationID(event.venue);
      if (!id)
        throw new APIError("Select an existing venue before approval.", 400);
      const venue = await req.payload.findByID({
        collection: "venues",
        id,
        depth: 0,
        req,
      });
      if (venue.isDemo || String(relationID(venue.city)) !== String(city))
        throw new APIError(
          "Choose a non-demo venue in this event's city.",
          400,
        );
      result.venue = venue.id;
      if (event.venueResolution === "update-existing") {
        const plan = parseRelationUpdate(event.venueUpdate, "venue");
        if (!plan || String(plan.recordId) !== String(id))
          throw new APIError(
            "Select the venue and fields to update in the update modal before approval.",
            400,
          );
        const changes: Record<string, unknown> = {};
        for (const field of plan.fields)
          changes[field] =
            event.submittedVenue[field as keyof typeof event.submittedVenue] ??
            null;
        await req.payload.update({
          collection: "venues",
          id: venue.id,
          req,
          depth: 0,
          data: changes,
        });
        result.venueResolution = "use-existing";
        result.venueUpdate = null;
      }
    } else if (event.venueResolution === "create-new") {
      const details = event.submittedVenue;
      await preventDuplicate("venues", details.name!, req, city);
      const cityRecord = await req.payload.findByID({
        collection: "cities",
        id: city,
        depth: 0,
        req,
      });
      const venue = await req.payload.create({
        collection: "venues",
        req,
        depth: 0,
        overrideAccess: true,
        data: {
          name: details.name!,
          city: cityRecord.id,
          slug: await createSlug("venues", details.name!, req, cityRecord.slug),
          area: details.area,
          address: details.address,
          mapUrl: details.mapUrl,
          isDemo: false,
        },
      });
      result.venue = venue.id;
      result.venueResolution = "use-existing";
    } else if (event.venueResolution === "omit") {
      result.venue = null;
    } else {
      throw new APIError(
        "Choose or update an existing venue, create one on approval, or leave it off this event.",
        400,
      );
    }
  }
  return result;
}
