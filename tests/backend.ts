import assert from "node:assert/strict";

import type { Event } from "@/types/payload-types";

import { EventReviews } from "../collections/event-reviews";
import { Events } from "../collections/events";
import { Organisers } from "../collections/organisers";
import { CITIES } from "../lib/calendar/constants";
import { validateEvent } from "../lib/calendar/event-hooks";
import { toPublicEvent } from "../lib/calendar/public-event";
import {
  eventProblems,
  httpURL,
  shortDescription,
} from "../lib/calendar/validation";

let checks = 0;
async function check(name: string, fn: () => unknown | Promise<unknown>) {
  await fn();
  checks++;
  console.log(`PASS ${name}`);
}
const valid = {
  id: 1,
  title: "Private host name",
  slug: "private-host-name",
  startAt: "2026-12-12T18:00:00+01:00",
  endAt: "2026-12-12T20:00:00+01:00",
  city: 1,
  industry: "art",
  eventType: "talk",
  access: "free",
  visibility: "public",
  status: "submitted",
  isDemo: false,
};
const hook = (
  data: Record<string, unknown>,
  originalDoc: any = valid,
  role = "approver",
  review: any = { aiStatus: "completed", humanDecision: "accepted" },
) =>
  validateEvent({
    data,
    originalDoc,
    operation: originalDoc ? "update" : "create",
    context: {},
    collection: {} as any,
    req: {
      user: { id: 7, role },
      payload: {
        find: async () => ({ docs: [review] }),
        findByID: async () => ({ city: 2 }),
      },
    } as any,
  });

await check("Six valid IANA city time zones", () => {
  assert.equal(CITIES.length, 6);
  for (const city of CITIES)
    assert.doesNotThrow(() =>
      new Intl.DateTimeFormat("en", { timeZone: city.timezone }).format(
        new Date(),
      ),
    );
});
await check("Free permits no URL; tickets and RSVP require URLs", () => {
  assert.deepEqual(eventProblems(valid), []);
  for (const access of ["tickets", "rsvp"])
    assert.ok(eventProblems({ ...valid, access }).length);
});
await check("Private links and inconsistent held dates are rejected", () => {
  assert.ok(
    eventProblems({
      ...valid,
      access: "private",
      actionUrl: "https://example.com",
    }).length,
  );
  assert.ok(eventProblems({ ...valid, visibility: "held-date" }).length);
});
await check(
  "Date order, unsafe links, duplicate industries and 60-word limit",
  () => {
    assert.ok(
      eventProblems({ ...valid, endAt: "2026-12-11T00:00:00Z" }).length,
    );
    assert.ok(eventProblems({ ...valid, secondaryIndustry: "art" }).length);
    assert.notEqual(httpURL("javascript:alert(1)"), true);
    assert.notEqual(shortDescription(Array(61).fill("word").join(" ")), true);
  },
);
await check(
  "Raw events, organiser contacts and review queue deny anonymous reads",
  async () => {
    for (const collection of [Events, Organisers, EventReviews])
      assert.equal(
        await collection.access!.read!({ req: { user: null } } as any),
        false,
      );
  },
);
await check(
  "Demo events and unapproved events never have a public projection",
  () => {
    assert.equal(
      toPublicEvent({ ...valid, isDemo: true, status: "published" } as Event),
      null,
    );
    assert.equal(toPublicEvent(valid as Event), null);
  },
);
const published = {
  ...valid,
  status: "published",
  approvedBy: 7,
  publishedAt: "2026-09-17T00:00:00Z",
  description: "Hidden detail",
  submittedBy: { email: "private@example.com" },
  organiser: { name: "Host", contact: { email: "private@example.com" } },
  venue: { name: "Private venue" },
};
await check(
  "Held date projection removes title, description, venue, organiser and action",
  () => {
    const result = JSON.stringify(
      toPublicEvent({
        ...published,
        visibility: "held-date",
        access: "private",
      } as unknown as Event),
    );
    for (const secret of [
      "Private host name",
      "private-host-name",
      "Hidden detail",
      "Private venue",
      "private@example.com",
      '"Host"',
    ])
      assert.ok(!result.includes(secret), secret);
  },
);
await check(
  "Industry projection hides organiser, venue and description",
  () => {
    const result = toPublicEvent({
      ...published,
      visibility: "industry",
    } as unknown as Event)!;
    assert.equal(result.organiser, undefined);
    assert.equal(result.venue, undefined);
    assert.equal(result.description, undefined);
    assert.equal(result.title, valid.title);
  },
);
await check("Public projection never exposes contact details", () =>
  assert.ok(
    !JSON.stringify(toPublicEvent(published as unknown as Event)).includes(
      "private@example.com",
    ),
  ),
);
await check(
  "Reviewer cannot approve; new records cannot bypass submission",
  async () => {
    await assert.rejects(() => hook({ status: "approved" }, valid, "reviewer"));
    await assert.rejects(() => hook({ ...valid, status: "published" }, null));
  },
);
await check(
  "Human approval requires completed AI and admin recommendation",
  async () => {
    await assert.rejects(() =>
      hook({ status: "approved" }, valid, "approver", {
        aiStatus: "pending",
        humanDecision: "pending",
      }),
    );
    const approved = await hook({ status: "approved" });
    assert.equal(approved.approvedBy, 7);
  },
);
await check(
  "Private approval requires direct organiser confirmation",
  async () => {
    await assert.rejects(() =>
      hook({ status: "approved" }, { ...valid, access: "invitation-only" }),
    );
  },
);
await check("Content edits invalidate approval and verification", async () => {
  const data = await hook(
    { title: "Changed" },
    { ...valid, status: "approved", approvedBy: 7, verified: true },
  );
  assert.equal(data.status, "submitted");
  assert.equal(data.approvedBy, null);
  assert.equal(data.verified, false);
});
await check(
  "Publication requires a separate approval; demo publication is blocked",
  async () => {
    await assert.rejects(() => hook({ status: "published" }));
    await assert.rejects(() =>
      hook({ status: "approved" }, { ...valid, isDemo: true }),
    );
    const result = await hook(
      { status: "published" },
      { ...valid, status: "approved", approvedBy: 7 },
    );
    assert.ok(result.publishedAt);
  },
);
await check(
  "Venue must match city and UTC conversion is deterministic",
  async () => {
    await assert.rejects(() => hook({ venue: 99 }));
    const result = await hook({});
    assert.equal(result.startAt, "2026-12-12T17:00:00.000Z");
  },
);
await check("Cancellation remains published in the safe projection", () =>
  assert.ok(
    toPublicEvent({ ...published, status: "cancelled" } as unknown as Event),
  ),
);
console.log(`${checks} backend checks passed.`);
