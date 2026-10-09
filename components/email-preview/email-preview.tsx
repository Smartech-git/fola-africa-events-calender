"use client";

import { useState } from "react";

import { SITE_NAME } from "@/constants/brand";
import type {
  EmailMessage,
  EventEmailKind,
} from "@/payload/emails/email-settings";

export default function EmailPreview({
  messages,
}: {
  messages: Record<EventEmailKind, EmailMessage>;
}) {
  const [kind, setKind] = useState<EventEmailKind>("published");
  const [width, setWidth] = useState("720");
  const [format, setFormat] = useState("html");
  const message = messages[kind];

  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 500 }}>
        {SITE_NAME} email preview
      </h1>
      <p style={{ lineHeight: 1.6 }}>
        Save changes to payload/emails/event-email-template.ts to update this
        preview. Sample data only; no email is sent.
      </p>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 24, margin: "24px 0" }}
      >
        <label>
          Email{" "}
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as EventEmailKind)}
            style={{ padding: 8 }}
          >
            <option value="published">Event published</option>
            <option value="submitted">Submission received</option>
          </select>
        </label>
        <label>
          Width{" "}
          <select
            value={width}
            onChange={(event) => setWidth(event.target.value)}
            style={{ padding: 8 }}
          >
            <option value="720">Desktop (720px)</option>
            <option value="375">Mobile (375px)</option>
          </select>
        </label>
        <label>
          Format{" "}
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value)}
            style={{ padding: 8 }}
          >
            <option value="html">HTML</option>
            <option value="text">Plain text</option>
          </select>
        </label>
      </div>
      <p style={{ lineHeight: 1.6 }}>
        <strong>Subject:</strong> {message.subject}
      </p>
      <div style={{ overflowX: "auto", paddingBottom: 16 }}>
        {format === "html" ? (
          <iframe
            title={`${kind === "published" ? "Event published" : "Submission received"} email preview`}
            srcDoc={message.html}
            sandbox="allow-same-origin"
            style={{
              display: "block",
              width: Number(width),
              height: 900,
              border: "1px solid #ADB0A6",
              background: "#F4F1EE",
            }}
          />
        ) : (
          <pre
            style={{
              boxSizing: "border-box",
              width: Number(width),
              padding: 24,
              border: "1px solid #ADB0A6",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              lineHeight: 1.6,
            }}
          >
            {message.text}
          </pre>
        )}
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.6 }}>
        Browser preview. Email clients may render fonts and spacing differently.
      </p>
    </main>
  );
}
