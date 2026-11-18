import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
} from "payload";

import { SKIP_BREVO_SYNC } from "@/payload/members/brevo-task";
import type { Member } from "@/payload-types";

const trusted = { depth: 0, overrideAccess: true } as const;
const MERGED_SUBSCRIBER = "mergedSubscriberId";

/**
 * Members hook: when a member is created with (or moved to) a subscribed
 * address, they keep that consent even if the sign-up box was left unticked.
 */
export const absorbSubscriber: CollectionBeforeChangeHook<Member> = async ({
  data,
  originalDoc,
  operation,
  context,
  req,
}) => {
  const email = data.email?.trim().toLowerCase();
  if (!email || (operation === "update" && email === originalDoc?.email))
    return data;
  const found = await req.payload.find({
    collection: "subscribers",
    where: { email: { equals: email } },
    limit: 1,
    req,
    ...trusted,
  });
  const subscriber = found.docs[0];
  if (!subscriber) return data;
  context[MERGED_SUBSCRIBER] = subscriber.id;
  if (subscriber.status !== "subscribed" || data.marketingConsent) return data;
  return {
    ...data,
    marketingConsent: true,
    marketingConsentAt: subscriber.consentAt ?? new Date().toISOString(),
  };
};

/** The subscriber record goes; the member's own Brevo sync owns the contact. */
export const removeMergedSubscriber: CollectionAfterChangeHook<Member> = async ({
  doc,
  context,
  req,
}) => {
  const id = context[MERGED_SUBSCRIBER];
  if (typeof id !== "number") return doc;
  await req.payload.delete({
    collection: "subscribers",
    id,
    req,
    context: { [SKIP_BREVO_SYNC]: true },
    ...trusted,
  });
  return doc;
};
