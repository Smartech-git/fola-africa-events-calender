import { after } from "next/server";

import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  PayloadRequest,
  TaskConfig,
} from "payload";

import {
  BREVO_QUEUE,
  BREVO_RETRIES,
  brevoConfigured,
  syncMemberToBrevo,
} from "@/payload/members/brevo";
import { relationID } from "@/payload/validation";
import type { Member } from "@/payload-types";

export const SYNC_BREVO_TASK = "sync-brevo-contact";

/** Pass in `context` when a change came from Brevo itself, so it is not sent back. */
export const SKIP_BREVO_SYNC = "skipBrevoSync";

// The fields Brevo holds. Sign-ins and token changes never trigger a sync.
const SYNCED_FIELDS = [
  "email",
  "status",
  "marketingConsent",
  "marketingConsentAt",
  "fullName",
  "organisation",
  "role",
  "industry",
  "country",
  "describes",
] as const satisfies (keyof Member)[];

function changed(doc: Member, previous?: Member) {
  if (!previous) return true;
  return (
    SYNCED_FIELDS.some((field) => doc[field] !== previous[field]) ||
    relationID(doc.city) !== relationID(previous.city)
  );
}

/** Runs the job straight after the response; the daily cron retries leftovers. */
function runAfterResponse(jobId: number | string) {
  try {
    after(async () => {
      try {
        // Imported late so the Payload config does not load its own runner.
        const { runBrevoSync } =
          await import("@/payload/members/run-brevo-sync");
        await runBrevoSync(1, jobId);
      } catch {
        console.error(
          "Brevo sync failed; the job stays queued for the scheduled run.",
        );
      }
    });
  } catch {
    // Scripts and the CLI have no request to run after; the cron picks it up.
  }
}

async function queueSync(
  req: PayloadRequest,
  input: { memberId: number; email: string; previousEmail?: string },
) {
  const job = await req.payload.jobs.queue({
    task: SYNC_BREVO_TASK,
    queue: BREVO_QUEUE,
    input,
    req,
  });
  runAfterResponse(job.id);
}

export const queueBrevoSync: CollectionAfterChangeHook<Member> = async ({
  doc,
  previousDoc,
  operation,
  context,
  req,
}) => {
  if (context[SKIP_BREVO_SYNC] || !brevoConfigured()) return doc;
  const previous = operation === "update" ? previousDoc : undefined;
  // Only members who are, or were, on the list concern Brevo.
  const relevant =
    doc.marketingConsent ||
    previous?.marketingConsent ||
    (previous && previous.email !== doc.email);
  if (!relevant || !changed(doc, previous)) return doc;
  await queueSync(req, {
    memberId: doc.id,
    email: doc.email,
    ...(previous && previous.email !== doc.email
      ? { previousEmail: previous.email }
      : {}),
  });
  return doc;
};

/** A deleted member's contact is deleted from Brevo too. */
export const queueBrevoRemoval: CollectionAfterDeleteHook<Member> = async ({
  doc,
  req,
}) => {
  if (!brevoConfigured()) return doc;
  await queueSync(req, { memberId: doc.id, email: doc.email });
  return doc;
};

export const syncBrevoContactTask: TaskConfig<{
  input: { memberId: number; email: string; previousEmail?: string };
  output: { result: string };
}> = {
  slug: SYNC_BREVO_TASK,
  label: "Sync member to Brevo",
  inputSchema: [
    { name: "memberId", type: "number", required: true },
    { name: "email", type: "email", required: true },
    { name: "previousEmail", type: "email" },
  ],
  outputSchema: [{ name: "result", type: "text", required: true }],
  // One member at a time, so an older change never lands after a newer one.
  concurrency: ({ input }) => `brevo-${input.memberId}`,
  retries: {
    attempts: BREVO_RETRIES,
    backoff: { type: "exponential", delay: 60_000 },
  },
  handler: async ({ input, req }) => ({
    output: { result: await syncMemberToBrevo(req.payload, input) },
  }),
};
