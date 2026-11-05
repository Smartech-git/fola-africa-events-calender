import type { CollectionSlug, Payload, TypedUser, Where } from "payload";

import { EventStatusTabs } from "@/payload/components/event-status-tabs";
import styles from "@/payload/components/members-metrics.module.css";

const RECENT_DAYS = 30;

const count = new Intl.NumberFormat("en");

function since(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/** Above the Events list: headline numbers, then the status tabs. */
export async function EventsMetrics({
  payload,
  user,
}: {
  payload: Payload;
  user?: TypedUser | null;
}) {
  if (!user) return null;
  const now = since(0);
  const recent = since(RECENT_DAYS);
  const total = (collection: CollectionSlug, where?: Where) =>
    payload
      .count({ collection, where, user, overrideAccess: false })
      .then(({ totalDocs }) => totalDocs);
  const events = (where?: Where) => total("events", where);
  const status = (value: string) => events({ status: { equals: value } });

  const [
    all,
    published,
    upcoming,
    submitted,
    approved,
    rejected,
    withdrawn,
    cancelled,
    postponed,
    submissions,
    newSubmissions,
    changes,
  ] = await Promise.all([
    events(),
    status("published"),
    events({
      and: [
        { status: { equals: "published" } },
        {
          or: [
            { startAt: { greater_than_equal: now } },
            { endAt: { greater_than_equal: now } },
          ],
        },
      ],
    }),
    status("submitted"),
    status("approved"),
    status("rejected"),
    status("withdrawn"),
    status("cancelled"),
    status("postponed"),
    events({ source: { equals: "submission" } }),
    events({
      and: [
        { source: { equals: "submission" } },
        { createdAt: { greater_than_equal: recent } },
      ],
    }),
    total("event-changes", { status: { equals: "pending" } }),
  ]);

  const metrics = [
    {
      label: "Total events",
      value: all,
      note: `${count.format(submissions)} from public submissions`,
    },
    {
      label: "Published",
      value: published,
      note: `${count.format(upcoming)} upcoming or on now`,
    },
    { label: "Submitted", value: submitted, note: "Waiting for review" },
    { label: "Approved", value: approved, note: "Ready to publish" },
    { label: "Rejected", value: rejected, note: "Submitter emailed" },
    { label: "Withdrawn", value: withdrawn, note: "Taken back by members" },
    {
      label: "Cancelled or postponed",
      value: cancelled + postponed,
      note: `${count.format(cancelled)} cancelled, ${count.format(postponed)} postponed`,
    },
    {
      label: "Change requests",
      value: changes,
      note: "Waiting for approval",
    },
    {
      label: "New submissions",
      value: newSubmissions,
      note: `In the last ${RECENT_DAYS} days`,
    },
  ];

  return (
    <>
      <dl className={styles.grid}>
        {metrics.map(({ label, value, note }) => (
          <div key={label} className={styles.card}>
            <dt>{label}</dt>
            <dd className={styles.value}>{count.format(value)}</dd>
            <dd className={styles.note}>{note}</dd>
          </div>
        ))}
      </dl>
      <EventStatusTabs counts={{ all, submitted, rejected, published }} />
    </>
  );
}
