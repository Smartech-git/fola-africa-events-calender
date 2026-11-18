import type { Payload, TypedUser, Where } from "payload";

import styles from "@/payload/components/members-metrics.module.css";
import { brevoAudience } from "@/payload/members/brevo";

const RECENT_DAYS = 30;

const count = new Intl.NumberFormat("en");

function since(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/** Above the Subscribers list: email-only sign-ups and the whole email list. */
export async function SubscribersMetrics({
  payload,
  user,
}: {
  payload: Payload;
  user?: TypedUser | null;
}) {
  if (!user) return null;
  const recent = since(RECENT_DAYS);
  const total = (collection: "subscribers" | "members", where?: Where) =>
    payload
      .count({ collection, where, user, overrideAccess: false })
      .then(({ totalDocs }) => totalDocs);

  const [subscribed, unsubscribed, joined, left, members] = await Promise.all([
    total("subscribers", { status: { equals: "subscribed" } }),
    total("subscribers", { status: { equals: "unsubscribed" } }),
    total("subscribers", {
      and: [
        { status: { equals: "subscribed" } },
        { consentAt: { greater_than_equal: recent } },
      ],
    }),
    total("subscribers", { unsubscribedAt: { greater_than_equal: recent } }),
    total("members", brevoAudience),
  ]);

  const metrics = [
    {
      label: "Subscribers",
      value: subscribed,
      note: `Email only · ${count.format(unsubscribed)} unsubscribed`,
    },
    {
      label: "Email list",
      value: subscribed + members,
      note: `Subscribers plus ${count.format(members)} opted-in members`,
    },
    {
      label: "New subscribers",
      value: joined,
      note: `Subscribed in the last ${RECENT_DAYS} days`,
    },
    {
      label: "Unsubscribed",
      value: left,
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
