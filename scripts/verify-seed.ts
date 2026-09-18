import assert from "node:assert/strict";

import { getPayload } from "payload";

import config from "@payload-config";

import { toPublicEvent } from "../lib/calendar/public-event";

const payload = await getPayload({ config });
try {
  const cities = await payload.find({ collection: "cities", limit: 10, depth: 0 });
  assert.equal(cities.totalDocs, 6);
  const events = await payload.find({ collection: "events", where: { isDemo: { equals: true } }, limit: 100, depth: 2 });
  assert.equal(events.totalDocs, 6);
  for (const event of events.docs) {
    assert.equal(event.status, "submitted");
    assert.equal(event.verified, false);
    assert.equal(toPublicEvent(event), null);
    const reviews = await payload.find({ collection: "event-reviews", where: { event: { equals: event.id } }, depth: 0, limit: 10 });
    assert.equal(reviews.totalDocs, 1);
    assert.equal(reviews.docs[0].aiStatus, "pending");
    assert.equal(reviews.docs[0].humanDecision, "pending");
  }
  for (const collection of ["events", "organisers", "venues", "event-reviews"] as const) {
    await assert.rejects(() => payload.find({ collection, overrideAccess: false, user: null, limit: 1 }), (error: any) => error.status === 403);
  }
  const settings = await payload.findGlobal({ slug: "review-settings" });
  assert.equal(settings.turnaroundWorkingDays, 2);
  for (const collection of ["cities", "organisers", "venues", "seasons", "events", "event-reviews"] as const) {
    const result = await payload.count({ collection });
    console.log(`${collection}: ${result.totalDocs}`);
  }
  console.log("Seed verified: demos unpublished/unverified, one review per demo, and private collections reject anonymous reads.");
} finally {
  await payload.destroy();
}
