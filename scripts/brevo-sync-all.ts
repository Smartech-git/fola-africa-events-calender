import { getPayload } from "payload";

import {
  brevoAudience,
  brevoConfigured,
  syncMemberToBrevo,
} from "@/payload/members/brevo";
import config from "@/payload.config";

// Sends every member who agreed to marketing to Brevo: the first load, or a
// repair after the sync was switched off. Changes after this sync themselves.
if (!brevoConfigured()) {
  console.error(
    "Set BREVO_API_KEY and BREVO_LIST_ID first (npm run brevo:setup).",
  );
  process.exit(1);
}

const payload = await getPayload({ config });
const members = await payload.find({
  collection: "members",
  where: brevoAudience,
  pagination: false,
  depth: 0,
  joins: false,
  select: { email: true },
});

let synced = 0;
let failed = 0;
for (const member of members.docs) {
  try {
    await syncMemberToBrevo(payload, {
      memberId: member.id,
      email: member.email,
    });
    synced++;
  } catch (error) {
    failed++;
    console.error(
      `Member ${member.id}:`,
      error instanceof Error ? error.message : error,
    );
  }
}
console.log(`Synced ${synced} of ${members.docs.length} members to Brevo.`);
process.exit(failed ? 1 : 0);
