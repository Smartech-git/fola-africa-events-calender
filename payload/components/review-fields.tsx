"use client";

import { useId, useState, type ReactNode } from "react";

import Link from "next/link";

import { useConfig, useField } from "@payloadcms/ui";
import type {
  JSONFieldClientProps,
  SelectFieldClientProps,
  TextareaFieldClientProps,
} from "payload";

import styles from "@/payload/components/review-fields.module.css";
import { reviewSchema } from "@/payload/reviews/review-schema";

function fieldLabel(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_.]/g, " ");
}

const recommendations = {
  "approve-as-submitted": {
    label: "Approve as submitted",
    severity: "success",
    sentence:
      "The AI recommends approving this event as submitted, with no changes.",
  },
  "approve-with-edits": {
    label: "Approve with edits",
    severity: "warning",
    sentence:
      "The AI recommends approving this event after the suggested changes have been reviewed and applied.",
  },
  "request-information": {
    label: "Request more information",
    severity: "warning",
    sentence:
      "The AI recommends requesting more information from the submitter before making a decision.",
  },
  reject: {
    label: "Reject submission",
    severity: "error",
    sentence:
      "The AI recommends rejecting this event. Review the findings before recording your decision.",
  },
};

function ReviewPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.panel} aria-label={title}>
      <h3 className={styles.title}>{title}</h3>
      {children}
    </section>
  );
}

export function ReviewFindings({ path }: JSONFieldClientProps) {
  const { value } = useField<unknown>({ potentiallyStalePath: path });
  const { config } = useConfig();
  const parsed = reviewSchema.shape.findings.safeParse(value);
  if (!parsed.success)
    return (
      <ReviewPanel title="Findings">
        <p>
          {value
            ? "These findings use an older format. Run a new AI review to display them here."
            : "Findings will appear when the AI review is complete."}
        </p>
      </ReviewPanel>
    );

  const findings = parsed.data;
  const groups = [
    {
      title: "Possible duplicate events",
      ids: findings.duplicateEventIds,
      collection: "events",
      label: "Event",
    },
    {
      title: "Events with overlapping dates",
      ids: findings.clashingEventIds,
      collection: "events",
      label: "Event",
    },
    {
      title: "Possible organiser matches",
      ids: findings.organiserMatchIds,
      collection: "organisers",
      label: "Organiser",
    },
    {
      title: "Possible venue matches",
      ids: findings.venueMatchIds,
      collection: "venues",
      label: "Venue",
    },
  ];
  const severityLabels = {
    info: "Information",
    warning: "Needs attention",
    error: "Issue to resolve",
  };

  return (
    <ReviewPanel title="Findings">
      <h4 className={styles.sectionHeading}>Items to review</h4>
      {findings.concerns.length ? (
        <ul className={styles.concerns}>
          {findings.concerns.map((concern, index) => (
            <li key={index} className={styles.concern}>
              <span className={styles.badge} data-severity={concern.severity}>
                {severityLabels[concern.severity]}
              </span>
              <strong className={styles.field}>
                {fieldLabel(concern.field)}
              </strong>
              <p className={styles.prose}>{concern.message}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No concerns flagged by the AI.</p>
      )}
      <div className={styles.matches}>
        {groups.map((group) => (
          <div key={group.title}>
            <h4 className={styles.sectionHeading}>{group.title}</h4>
            {group.ids.length ? (
              <ul>
                {group.ids.map((id) => (
                  <li key={id}>
                    <Link
                      href={`${config.routes.admin}/collections/${group.collection}/${id}`}
                    >
                      {group.label} #{id}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>None identified in the records checked.</p>
            )}
          </div>
        ))}
      </div>
      <p className={styles.hint}>
        AI findings are suggestions for your review, not verified facts.
      </p>
    </ReviewPanel>
  );
}

export function ReviewPrompt({ path }: TextareaFieldClientProps) {
  const { value } = useField<string>({ potentiallyStalePath: path });
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const isLong = Boolean(value && value.length > 320);
  return (
    <ReviewPanel title="Prompt snapshot">
      <p className={styles.hint}>Instructions used for this AI review.</p>
      <p id={id} className={styles.prose}>
        {value
          ? isLong && !expanded
            ? `${value.slice(0, 320).trimEnd()}…`
            : value
          : "No prompt has been recorded yet."}
      </p>
      {isLong && (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </ReviewPanel>
  );
}

export function ReviewSummary({ path }: TextareaFieldClientProps) {
  const { value } = useField<string>({ potentiallyStalePath: path });
  return (
    <ReviewPanel title="Summary">
      <p className={styles.prose}>
        {value || "The summary will appear when the AI review is complete."}
      </p>
    </ReviewPanel>
  );
}

export function ReviewSuggestedListing({ path }: JSONFieldClientProps) {
  const { value } = useField<unknown>({ potentiallyStalePath: path });
  const parsed = reviewSchema.shape.suggestedListing.safeParse(value);
  if (!parsed.success)
    return (
      <ReviewPanel title="Suggested listing">
        <p>
          {value
            ? "This saved suggestion could not be displayed in the current format."
            : "Suggested changes will appear when the AI review is complete."}
        </p>
      </ReviewPanel>
    );

  const { title, description, changes } = parsed.data;
  return (
    <ReviewPanel title="Suggested listing">
      <div className={styles.matches}>
        <div>
          <h4 className={styles.sectionHeading}>Suggested title</h4>
          <p className={styles.prose}>{title || "Keep the original title."}</p>
        </div>
        <div>
          <h4 className={styles.sectionHeading}>Suggested description</h4>
          <p className={styles.prose}>
            {description || "Keep the original description."}
          </p>
        </div>
      </div>
      <h4 className={styles.sectionHeading}>Recommended changes</h4>
      {changes.length ? (
        <ul className={styles.concerns}>
          {changes.map((change, index) => (
            <li key={index} className={styles.concern}>
              <h4 className={styles.field}>{fieldLabel(change.field)}</h4>
              <p className={styles.prose}>{change.suggestion}</p>
              <p className={styles.prose}>
                <strong>Why: </strong>
                {change.reason}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No additional changes suggested.</p>
      )}
      <p className={styles.hint}>
        These suggestions have not been applied to the event.
      </p>
    </ReviewPanel>
  );
}

export function ReviewRecommendation({ path }: SelectFieldClientProps) {
  const { value } = useField<unknown>({ potentiallyStalePath: path });
  const parsed = reviewSchema.shape.recommendation.safeParse(value);
  const recommendation = parsed.success
    ? recommendations[parsed.data]
    : undefined;
  return (
    <ReviewPanel title="AI recommendation">
      {recommendation ? (
        <>
          <span
            className={styles.badge}
            data-severity={recommendation.severity}
          >
            {recommendation.label}
          </span>
          <p className={styles.prose}>{recommendation.sentence}</p>
          <p className={styles.hint}>
            The final decision remains with the reviewer.
          </p>
        </>
      ) : (
        <p>
          {value
            ? "This saved recommendation is not recognised."
            : "A recommendation will appear when the AI review is complete."}
        </p>
      )}
    </ReviewPanel>
  );
}
