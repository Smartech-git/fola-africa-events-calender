import "server-only";

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

function duplicateSubmission(): SubmitEventResult {
  const message = "This event has already been submitted.";
  return {
    success: false,
    status: 409,
    error: message,
    fieldErrors: { title: [message] },
  };
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
    const titleSlug = formatSlug(data.title);
    if (!titleSlug)
      return {
        success: false,
        status: 400,
        fieldErrors: {
          title: ["Include letters or numbers in the event title."],
        },
      };

    // Include pending and manually added events, even if their slug was edited.
    // Compare only the title in memory; never return private matching records.
    const alreadySubmitted = async (transactionID?: string | number) => {
      const matches = await payload.find({
        collection: "events",
        req: transactionID ? { transactionID } : undefined,
        where: {
          and: [
            { city: { equals: city.id } },
            { startAt: { equals: startAt } },
            { isDemo: { not_equals: true } },
          ],
        },
        select: { title: true },
        pagination: false,
        depth: 0,
        overrideAccess: true,
      });
      return matches.docs.some(
        (event) => formatSlug(event.title) === titleSlug,
      );
    };
    if (await alreadySubmitted()) return duplicateSubmission();

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

    // Repeating titles still need distinct URLs for different occurrences.
    const slugExists = async (slug: string) =>
      (
        await payload.count({
          collection: "events",
          where: { slug: { equals: slug } },
        })
      ).totalDocs > 0;
    let eventSlug = titleSlug;
    if (await slugExists(eventSlug)) {
      const scopedSlug = `${titleSlug}-${city.slug}-${formatSlug(data.startAt)}`;
      eventSlug = scopedSlug;
      let suffix = 2;
      while (await slugExists(eventSlug))
        eventSlug = `${scopedSlug}-${suffix++}`;
    }

    for (const { name, field } of [
      {
        name: data.organiserName,
        field: "organiserName",
      },
      { name: data.venueName, field: "venueName" },
    ] as const) {
      if (!name) continue;
      const slug = formatSlug(name);
      if (!slug)
        return {
          success: false,
          status: 400,
          fieldErrors: { [field]: ["Include letters or numbers in the name."] },
        };
    }

    const transactionID = await payload.db.beginTransaction();
    if (!transactionID)
      throw new Error("A submission transaction could not be started.");
    const req = { transactionID };
    try {
      // Recheck after slug selection so overlapping retries cannot bypass the
      // duplicate check by choosing a different URL after another save finishes.
      if (await alreadySubmitted(transactionID)) {
        await payload.db.rollbackTransaction(transactionID);
        return duplicateSubmission();
      }
      await payload.create({
        collection: "events",
        req,
        depth: 0,
        overrideAccess: true,
        data: {
          title: data.title,
          slug: eventSlug,
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
          submittedOrganiser: {
            name: data.organiserName,
            type: data.organiserType,
            website: data.organiserWebsite || undefined,
            contactEmail: data.organiserContact,
          },
          submittedVenue: data.venueName
            ? {
                name: data.venueName,
                area: data.venueArea,
                address: data.venueAddress,
                mapUrl: data.venueMapUrl || undefined,
              }
            : undefined,
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
      // The unique slug also catches concurrent identical submissions. After
      // rollback, report the duplicate without exposing database errors.
      if (await alreadySubmitted()) return duplicateSubmission();
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
