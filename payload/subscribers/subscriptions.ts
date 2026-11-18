import { getCalendarPayload } from "@/payload/queries/calendar-query";

const trusted = { depth: 0, overrideAccess: true } as const;

/**
 * Subscribes an address to Happenings emails. Submitting is the consent. A
 * member with that address is opted in on their profile instead, so each
 * address has one record and one consent.
 */
export async function addSubscriber(email: string, source: "popup") {
  const payload = await getCalendarPayload();
  const now = new Date().toISOString();

  const members = await payload.find({
    collection: "members",
    where: { email: { equals: email } },
    limit: 1,
    joins: false,
    ...trusted,
  });
  const member = members.docs[0];
  if (member) {
    if (!member.marketingConsent)
      await payload.update({
        collection: "members",
        id: member.id,
        data: { marketingConsent: true, marketingConsentAt: now },
        ...trusted,
      });
    return;
  }

  const existing = await payload.find({
    collection: "subscribers",
    where: { email: { equals: email } },
    limit: 1,
    ...trusted,
  });
  const subscriber = existing.docs[0];
  if (subscriber) {
    if (subscriber.status !== "subscribed")
      await payload.update({
        collection: "subscribers",
        id: subscriber.id,
        data: { status: "subscribed" },
        ...trusted,
      });
    return;
  }

  try {
    await payload.create({
      collection: "subscribers",
      data: { email, status: "subscribed", source },
      ...trusted,
    });
  } catch (error) {
    // A simultaneous request for the same address hit the unique index.
    const again = await payload.find({
      collection: "subscribers",
      where: { email: { equals: email } },
      limit: 1,
      ...trusted,
    });
    if (!again.docs.length) throw error;
  }
}
