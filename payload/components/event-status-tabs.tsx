"use client";

import { useListQuery } from "@payloadcms/ui";
import type { Where } from "payload";

import styles from "@/payload/components/event-status-tabs.module.css";

const TABS = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Rejected", value: "rejected" },
  { label: "Published", value: "published" },
] as const;

type Tab = (typeof TABS)[number]["value"];

/** The status the list is filtered to, wherever the filter builder put it. */
function statusOf(where: unknown): string | undefined {
  if (!where || typeof where !== "object") return undefined;
  if (Array.isArray(where)) {
    for (const entry of where) {
      const found = statusOf(entry);
      if (found) return found;
    }
    return undefined;
  }
  const record = where as Record<string, unknown>;
  const status = record.status as { equals?: unknown } | undefined;
  if (typeof status?.equals === "string") return status.equals;
  return statusOf(record.or) ?? statusOf(record.and);
}

/** True when the list has any filter, ignoring empty and/or groups. */
function filtered(where: Where | Where[] | undefined): boolean {
  if (!where) return false;
  if (Array.isArray(where)) return where.some(filtered);
  return Object.entries(where).some(([key, value]) =>
    key === "and" || key === "or" ? filtered(value as Where[]) : true,
  );
}

/** Status filters above the Events list; All clears the filter. */
export function EventStatusTabs({ counts }: { counts: Record<Tab, number> }) {
  const { query, refineListData } = useListQuery();
  const status = statusOf(query.where);
  const current: Tab | undefined = status
    ? TABS.find((tab) => tab.value === status)?.value
    : filtered(query.where)
      ? undefined
      : "all";

  const select = (tab: Tab) =>
    refineListData({
      // The filter builder's shape, so the Filters panel shows it too.
      where:
        tab === "all" ? {} : { or: [{ and: [{ status: { equals: tab } }] }] },
    });

  return (
    <div className={styles.tabs} role="group" aria-label="Filter by status">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className={styles.tab}
          aria-pressed={current === tab.value}
          onClick={() => select(tab.value)}
        >
          {tab.label}
          <span className={styles.count}>{counts[tab.value]}</span>
        </button>
      ))}
    </div>
  );
}
