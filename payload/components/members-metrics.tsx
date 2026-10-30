import type { Payload, TypedUser, Where } from "payload";

import styles from "@/payload/components/members-metrics.module.css";
import { brevoAudience } from "@/payload/members/brevo";

const RECENT_DAYS = 30;

const count = new Intl.NumberFormat("en");

function since(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function share(part: number, whole: number) {
  return whole ? `${Math.round((part / whole) * 100)}%` : "0%";
}

/** Above the Members list: headline numbers for the whole collection. */
export async function MembersMetrics({
  payload,
  user,
}: {
  payload: Payload;
  user?: TypedUser | null;
}) {
  if (!user) return null;
  const recent = since(RECENT_DAYS);
  const total = (where?: Where) =>
    payload
      .count({ collection: "members", where, user, overrideAccess: false })
      .then(({ totalDocs }) => totalDocs);

  const [members, active, subscribers, verified, joined, signedIn] =
    await Promise.all([
      total(),
      total({ status: { equals: "active" } }),
      total(brevoAudience),
      total({ emailVerifiedAt: { exists: true } }),
      total({ createdAt: { greater_than_equal: recent } }),
      total({ lastSignInAt: { greater_than_equal: recent } }),
    ]);

  const metrics = [
    {
      label: "Members",
      value: members,
      note: `${count.format(active)} active, ${count.format(members - active)} suspended`,
    },
    {
      label: "Marketing subscribers",
      value: subscribers,
      note: `${share(subscribers, active)} of active members`,
    },
    {
      label: "Verified emails",
      value: verified,
      note: `${share(verified, members)} of members`,
    },
    {
      label: "New members",
      value: joined,
      note: `Joined in the last ${RECENT_DAYS} days`,
    },
    {
      label: "Recently signed in",
      value: signedIn,
      note: `In the last ${RECENT_DAYS} days`,
    },
  ];

  return (
    <dl className={styles.grid}>
      {metrics.map(({ label, value, note }) => (
        <div key={label} className={styles.card}>
          <dt>{label}</dt>
          <dd className={styles.value}>{count.format(value)}</dd>
          <dd className={styles.note}>{note}</dd>
        </div>
      ))}
    </dl>
  );
}
