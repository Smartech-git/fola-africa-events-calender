"use client";

import { useState, type CSSProperties } from "react";

import { SITE_NAME } from "@/constants/brand";
import type {
  EmailMessage,
  EventEmailKind,
} from "@/payload/emails/email-settings";

// Inline Happenings palette: this preview route does not load globals.css.
const colours = {
  red: "#B51C17",
  cream: "#F4E3D7",
  ink: "#1A1A1A",
  white: "#FFFFFF",
};
const mono = "'Courier Prime', 'Courier New', Courier, monospace";
const caps: CSSProperties = {
  fontFamily: mono,
  fontSize: 13,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};
const field: CSSProperties = {
  ...caps,
  padding: "10px 12px",
  border: `1px solid ${colours.ink}`,
  borderRadius: 0,
  background: colours.white,
  color: colours.ink,
  marginTop: 8,
  display: "block",
};

export default function EmailPreview({
  messages,
}: {
  messages: Record<EventEmailKind, EmailMessage>;
}) {
  const [kind, setKind] = useState<EventEmailKind>("published");
  const [width, setWidth] = useState("720");
  const [format, setFormat] = useState("html");
  const message = messages[kind];
  const frame: CSSProperties = {
    display: "block",
    width: Number(width),
    border: `1px solid ${colours.ink}`,
  };

  return (
    <>
      <header
        style={{
          background: colours.red,
          color: colours.white,
          padding: "28px 24px",
        }}
      >
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <p style={{ ...caps, margin: "0 0 12px" }}>● Email preview</p>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 500,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {SITE_NAME}
          </h1>
          <p
            style={{
              color: colours.cream,
              margin: "12px 0 0",
              lineHeight: 1.6,
            }}
          >
            Save changes to payload/emails/event-email-template.ts to update
            this preview. Sample data only; no email is sent.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: 24 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            margin: "0 0 24px",
          }}
        >
          <label style={{ ...caps, color: colours.red }}>
            Email
            <select
              value={kind}
              onChange={(event) =>
                setKind(event.target.value as EventEmailKind)
              }
              style={field}
            >
              <option value="published">Happening is live</option>
              <option value="submitted">Submission received</option>
            </select>
          </label>
          <label style={{ ...caps, color: colours.red }}>
            Width
            <select
              value={width}
              onChange={(event) => setWidth(event.target.value)}
              style={field}
            >
              <option value="720">Desktop (720px)</option>
              <option value="375">Mobile (375px)</option>
            </select>
          </label>
          <label style={{ ...caps, color: colours.red }}>
            Format
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              style={field}
            >
              <option value="html">HTML</option>
              <option value="text">Plain text</option>
            </select>
          </label>
        </div>

        <p
          style={{
            background: colours.cream,
            padding: "14px 16px",
            margin: "0 0 24px",
            lineHeight: 1.6,
          }}
        >
          <span style={{ ...caps, color: colours.red }}>Subject</span>
          <br />
          {message.subject}
        </p>

        <div style={{ overflowX: "auto", paddingBottom: 16 }}>
          {format === "html" ? (
            <iframe
              title={`${kind === "published" ? "Happening is live" : "Submission received"} email preview`}
              srcDoc={message.html}
              sandbox="allow-same-origin"
              style={{ ...frame, height: 1000, background: colours.cream }}
            />
          ) : (
            <pre
              style={{
                ...frame,
                boxSizing: "border-box",
                padding: 24,
                margin: 0,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                lineHeight: 1.6,
                fontFamily: mono,
              }}
            >
              {message.text}
            </pre>
          )}
        </div>
        <p style={{ ...caps, fontSize: 11, color: "rgba(26,26,26,0.6)" }}>
          Browser preview. Email clients may render fonts and spacing
          differently.
        </p>
      </main>
    </>
  );
}
