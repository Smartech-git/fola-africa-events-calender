"use client";

import { useEffect, useState } from "react";

import {
  Button,
  toast,
  useConfig,
  useDocumentInfo,
  useForm,
  useFormFields,
} from "@payloadcms/ui";

import styles from "@/payload/components/review-decision-email.module.css";
import { relationID } from "@/payload/validation";

type Decision = "rejected" | "request-information";

type Submission = {
  status?: string;
  source?: string;
  submittedBy?: { name?: string | null; email?: string | null } | null;
};

const COPY: Record<Decision, { button: string; note: string }> = {
  rejected: {
    button: "Send rejection email",
    note: "The submitter is told the happening won’t be listed, with your message. The event is marked Rejected and leaves the review queue. A submitter with an account can edit it and resubmit, which puts it back in the queue.",
  },
  "request-information": {
    button: "Send information request",
    note: "The submitter is asked for more detail, with your message. Replies go to the team inbox; the event stays in review.",
  },
};

/**
 * Under the human decision on an Event Review: a rejection or information
 * request is only saved by sending it, so the submitter always hears back.
 */
export function ReviewDecisionEmail() {
  const { id } = useDocumentInfo();
  const { config } = useConfig();
  const { setModified } = useForm();
  const decision = useFormFields(([fields]) => fields.humanDecision?.value) as
    string | undefined;
  const message = useFormFields(
    ([fields]) => (fields.draftMessage?.value as string | undefined) ?? "",
  );
  const eventId = useFormFields(([fields]) =>
    relationID(fields.event?.value as never),
  );
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [sending, setSending] = useState(false);
  const api = config.routes.api;

  useEffect(() => {
    if (!eventId) return;
    const controller = new AbortController();
    fetch(`${api}/events/${eventId}?depth=0`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then(setSubmission)
      .catch(() => {});
    return () => controller.abort();
  }, [api, eventId]);

  if (decision !== "rejected" && decision !== "request-information")
    return null;
  const copy = COPY[decision];
  const to = submission?.submittedBy?.email;
  const waiting = submission?.status === "submitted";

  const send = async () => {
    setSending(true);
    try {
      const response = await fetch(`${api}/event-reviews/${id}/send-decision`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, message }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          result?.errors?.[0]?.message ?? "Unable to send the email.",
        );
      toast.success(`Email queued to ${result.recipient}.`);
      // The decision is saved; reload without the unsaved-changes prompt.
      setModified(false);
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send the email.",
      );
      setSending(false);
    }
  };

  return (
    <div className={styles.root}>
      <p className={styles.note}>
        {copy.note}
        {to && (
          <>
            {" "}
            Sends to{" "}
            <strong>
              {submission?.submittedBy?.name
                ? `${submission.submittedBy.name} <${to}>`
                : to}
            </strong>
            .
          </>
        )}
      </p>
      {submission && !waiting ? (
        <p className={styles.note}>
          This submission is no longer waiting for review, so nothing can be
          sent.
        </p>
      ) : (
        <Button
          type="button"
          buttonStyle="primary"
          size="small"
          margin={false}
          disabled={sending || !message.trim() || !submission}
          onClick={send}
        >
          {sending ? "Sending…" : copy.button}
        </Button>
      )}
      {!message.trim() && (
        <p className={styles.note}>
          Write the message to the submitter above first.
        </p>
      )}
    </div>
  );
}
