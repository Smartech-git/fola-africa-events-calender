import { getPayload } from "payload";

import config from "@payload-config";

import { SEED_CITIES, DEFAULT_REVIEW_PROMPT } from "../payload/constants";

const payload = await getPayload({ config });

try {
  let created = 0;
  for (const city of SEED_CITIES) {
    const existing = await payload.find({
      collection: "cities",
      where: { slug: { equals: city.slug } },
      limit: 1,
      depth: 0,
    });
    const record =
      existing.docs[0] ||
      (await payload.create({ collection: "cities", data: city }));
    if (!existing.docs[0]) created++;
    if (!process.argv.includes("demo")) continue;

    const organiserSlug = `demo-${city.slug}-organiser`;
    const organisers = await payload.find({
      collection: "organisers",
      where: { slug: { equals: organiserSlug } },
      limit: 1,
      depth: 0,
    });
    const organiser =
      organisers.docs[0] ||
      (await payload.create({
        collection: "organisers",
        data: {
          name: `DEMO — ${city.name} Cultural Collective (fictional)`,
          slug: organiserSlug,
          type: "institution",
          isDemo: true,
        },
      }));
    if (!organisers.docs[0]) created++;

    const venueSlug = `demo-${city.slug}-venue`;
    const venues = await payload.find({
      collection: "venues",
      where: { slug: { equals: venueSlug } },
      limit: 1,
      depth: 0,
    });
    const venue =
      venues.docs[0] ||
      (await payload.create({
        collection: "venues",
        data: {
          name: `DEMO — ${city.name} Sample Hall (fictional)`,
          slug: venueSlug,
          city: record.id,
          area: "Sample area",
          isDemo: true,
        },
      }));
    if (!venues.docs[0]) created++;

    const seasonSlug = `demo-${city.slug}-december-2026`;
    const seasons = await payload.find({
      collection: "seasons",
      where: { slug: { equals: seasonSlug } },
      limit: 1,
      depth: 0,
    });
    const season =
      seasons.docs[0] ||
      (await payload.create({
        collection: "seasons",
        data: {
          name: `DEMO — ${city.name} December 2026`,
          slug: seasonSlug,
          city: record.id,
          startDate: "2026-12-01T00:00:00.000Z",
          endDate: "2026-12-31T00:00:00.000Z",
          description:
            "Fictional season for testing the calendar. Not a verified schedule.",
          status: "provisional",
          isPublished: false,
          isDemo: true,
        },
      }));
    if (!seasons.docs[0]) created++;

    // Cover public, industry and held-date visibility, including ticketed/RSVP examples.
    const index = SEED_CITIES.findIndex((entry) => entry.slug === city.slug);
    const access = (
      ["free", "tickets", "rsvp", "invitation-only", "private", "free"] as const
    )[index];
    const visibility =
      access === "private"
        ? "held-date"
        : access === "invitation-only"
          ? "industry"
          : "public";
    const eventSlug = `demo-${city.slug}-culture-talk`;
    const events = await payload.find({
      collection: "events",
      where: { slug: { equals: eventSlug } },
      limit: 1,
      depth: 0,
    });
    if (!events.docs[0]) {
      // 18:00 city time, encoded with an explicit offset before conversion to UTC.
      const offset =
        city.timezoneLabel === "WAT"
          ? "+01:00"
          : ["CAT", "SAST"].includes(city.timezoneLabel)
            ? "+02:00"
            : "+00:00";
      await payload.create({
        collection: "events",
        data: {
          title: `DEMO — ${city.name} Culture Talk`,
          slug: eventSlug,
          city: record.id,
          startAt: new Date(`2026-12-12T18:00:00${offset}`).toISOString(),
          endAt: new Date(`2026-12-12T19:30:00${offset}`).toISOString(),
          allDay: false,
          industry: "art",
          eventType: "talk",
          access,
          visibility,
          actionUrl: ["tickets", "rsvp"].includes(access)
            ? "https://example.com/demo-event"
            : undefined,
          organiser: organiser.id,
          venue: venue.id,
          seasons: [season.id],
          description:
            "Fictional demonstration listing for testing. This is not a real event and must not be published.",
          status: "submitted",
          verified: false,
          source: "demo",
          isDemo: true,
        },
      });
      created++;
    }
  }

  // Real Lagos season names from the brief; no invented dates or publication.
  const lagos = (
    await payload.find({
      collection: "cities",
      where: { slug: { equals: "lagos" } },
      limit: 1,
    })
  ).docs[0];
  for (const [name, slug] of [
    ["Lagos Fashion Week", "lagos-fashion-week"],
    ["ART X week", "art-x-week"],
    ["Lagos December", "lagos-december"],
  ]) {
    const existing = await payload.find({
      collection: "seasons",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    if (!existing.docs[0]) {
      await payload.create({
        collection: "seasons",
        data: {
          name,
          slug,
          city: lagos.id,
          status: "provisional",
          isPublished: false,
          isDemo: false,
        },
      });
      created++;
    }
  }
  const settings = await payload.findGlobal({ slug: "review-settings" });
  if (!settings.createdAt) {
    await payload.updateGlobal({
      slug: "review-settings",
      data: {
        promptVersion: "fola-beta-v1",
        systemPrompt: DEFAULT_REVIEW_PROMPT,
        turnaroundWorkingDays: 2,
        minimumVerifiedEventsPerCity: 25,
      },
    });
    created++;
  }
  payload.logger.info(
    `Seed complete: ${created} records created. Existing records preserved. Demo events remain Submitted and unverified.`,
  );
} finally {
  await payload.destroy();
}
