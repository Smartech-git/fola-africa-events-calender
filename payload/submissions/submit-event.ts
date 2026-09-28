import "server-only";

import { randomUUID } from "node:crypto";

import { parseDateTime, toZoned } from "@internationalized/date";

import { formatSlug } from "@/payload/fields/format-slug";
import { getCalendarPayload } from "@/payload/queries/calendar-query";
import {
  submitEventSchema,
  type SubmitEventValues,
} from "@/validations/submit-event";

export interface SubmitEventResult {
  success: boolean;
  status: number;
  error?: string;
  fieldErrors?: Partial<Record<keyof SubmitEventValues, string[]>>;
}

export async function createEventSubmission(
  input: unknown,
): Promise<SubmitEventResult> {
  const parsed = submitEventSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      status: 400,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  const data = parsed.data;
  try {
    const payload = await getCalendarPayload();
    const cityResult = await payload.find({
      collection: "cities",
      where: { id: { equals: Number(data.city) } },
      limit: 1,
      depth: 0,
    });
    const city = cityResult.docs[0];
    if (!city)
      return {
        success: false,
        status: 400,
        fieldErrors: { city: ["Choose an available city."] },
      };

    // Interpret the entered wall time in the selected city's zone, never the browser's.
    let startAt: string;
    let endAt: string | undefined;
    try {
      const utc = (value: string) =>
        toZoned(parseDateTime(value), city.timezone, "reject")
          .toDate()
          .toISOString();
      startAt = utc(data.startAt);
      endAt = data.endAt ? utc(data.endAt) : undefined;
    } catch {
      return {
        success: false,
        status: 400,
        fieldErrors: {
          startAt: ["Check the dates and times in this city's time zone."],
        },
      };
    }
    if (data.seasons.length) {
      const seasons = await payload.find({
        collection: "seasons",
        where: {
          and: [
            { id: { in: data.seasons.map(Number) } },
            { city: { equals: city.id } },
            { isPublished: { equals: true } },
            { isDemo: { not_equals: true } },
          ],
        },
        pagination: false,
        depth: 0,
      });
      if (seasons.docs.length !== new Set(data.seasons).size)
        return {
          success: false,
          status: 400,
          fieldErrors: { seasons: ["Choose available seasons for this city."] },
        };
    }
    // A persisted, shared limit for both the endpoint and server action.
    const recent = await payload.count({
      collection: "events",
      where: {
        and: [
          { source: { equals: "submission" } },
          {
            "submittedBy.email": { equals: data.submitterEmail.toLowerCase() },
          },
          {
            createdAt: {
              greater_than: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            },
          },
        ],
      },
    });
    if (recent.totalDocs >= 5)
      return {
        success: false,
        status: 429,
        error:
          "You've submitted several events recently. Please try again in an hour.",
      };

    const transactionID = await payload.db.beginTransaction();
    if (!transactionID)
      throw new Error("A submission transaction could not be started.");
    const req = { transactionID };
    const slug = (name: string) =>
      `${formatSlug(name).slice(0, 100) || "submission"}-${randomUUID()}`;
    try {
      // Never overwrite trusted organiser or venue records with public submissions.
      const organiser = await payload.create({
        collection: "organisers",
        req,
        depth: 0,
        overrideAccess: true,
        data: {
          name: data.organiserName,
          slug: slug(data.organiserName),
          type: data.organiserType,
          website: data.organiserWebsite || undefined,
          contact: { email: data.organiserContact },
          isDemo: false,
        },
      });
      const venue = data.venueName
        ? await payload.create({
            collection: "venues",
            req,
            depth: 0,
            overrideAccess: true,
            data: {
              name: data.venueName,
              slug: slug(data.venueName),
              city: city.id,
              area: data.venueArea,
              address: data.venueAddress,
              mapUrl: data.venueMapUrl || undefined,
              isDemo: false,
            },
          })
        : undefined;
      await payload.create({
        collection: "events",
        req,
        depth: 0,
        overrideAccess: true,
        data: {
          title: data.title,
          slug: slug(data.title),
          city: city.id,
          startAt,
          endAt,
          allDay: data.allDay,
          eventType: data.eventType,
          industry: data.industry,
          secondaryIndustry: data.secondaryIndustry || undefined,
          access: data.access,
          visibility: data.visibility,
          actionUrl: data.actionUrl || undefined,
          organiser: organiser.id,
          venue: venue?.id,
          seasons: data.seasons.map(Number),
          description: data.description,
          submittedBy: {
            name: data.submitterName,
            email: data.submitterEmail.toLowerCase(),
            relationship: data.relationship,
          },
          source: "submission",
          status: "submitted",
          verified: false,
          organiserConfirmed: false,
          isDemo: false,
        },
      });
      await payload.db.commitTransaction(transactionID);
    } catch (error) {
      await payload.db.rollbackTransaction(transactionID);
      throw error;
    }
    return { success: true, status: 201 };
  } catch {
    return {
      success: false,
      status: 500,
      error: "We couldn't submit your event. Please try again.",
    };
  }
}
