import { getPayload } from "payload";

import {
  brevoAudience,
  brevoConfigured,
  syncMemberToBrevo,
  syncSubscriberToBrevo,
} from "@/payload/members/brevo";
import config from "@/payload.config";

// Sends every member who agreed to marketing, and every email-only subscriber,
// to Brevo: the first load, or a repair after the sync was switched off.
// Changes after this sync themselves.
if (!brevoConfigured()) {
  console.error(
    "Set BREVO_API_KEY and BREVO_LIST_ID first (npm run brevo:setup).",
  );
  process.exit(1);
}

const payload = await getPayload({ config });
const [members, subscribers] = await Promise.all([
  payload.find({
    collection: "members",
    where: brevoAudience,
    pagination: false,
    depth: 0,
    joins: false,
    select: { email: true },
  }),
  payload.find({
    collection: "subscribers",
    where: { status: { equals: "subscribed" } },
    pagination: false,
    depth: 0,
    select: { email: true },
  }),
]);

let failed = 0;
async function run(label: string, id: number, sync: () => Promise<unknown>) {
  try {
    await sync();
    return true;
  } catch (error) {
    failed++;
    console.error(
      `${label} ${id}:`,
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

let syncedMembers = 0;
for (const member of members.docs)
  if (
    await run("Member", member.id, () =>
      syncMemberToBrevo(payload, { memberId: member.id, email: member.email }),
    )
  )
    syncedMembers++;

let syncedSubscribers = 0;
for (const subscriber of subscribers.docs)
  if (
    await run("Subscriber", subscriber.id, () =>
      syncSubscriberToBrevo(payload, {
        subscriberId: subscriber.id,
        email: subscriber.email,
      }),
    )
  )
    syncedSubscribers++;

console.log(
  `Synced ${syncedMembers} of ${members.docs.length} members and ${syncedSubscribers} of ${subscribers.docs.length} subscribers to Brevo.`,
);
process.exit(failed ? 1 : 0);
