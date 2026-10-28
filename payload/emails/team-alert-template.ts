import { SITE_NAME } from "@/constants/brand";
import {
  ACCESS_OPTIONS,
  EVENT_TYPES,
  INDUSTRIES,
  SUBMITTER_RELATIONSHIPS,
  VISIBILITY_OPTIONS,
} from "@/payload/constants";
import type { EmailMessage } from "@/payload/emails/email-settings";
import { escapeHtml } from "@/payload/emails/event-email-template";
import type { Event } from "@/payload-types";

const theme = {
  red: "#B51C17",
  cream: "#F4E3D7",
  ink: "#1A1A1A",
  white: "#FFFFFF",
  muted: "rgba(26,26,26,0.6)",
};
const monoFont = "'Courier Prime', 'Courier New', Courier, monospace";
const sansFont = "Montreal, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const label = (color: string = theme.muted) =>
  `font-family:${monoFont};font-size:11px;line-height:1.4;letter-spacing:0.08em;text-transform:uppercase;color:${color};`;
const value = `font-family:${sansFont};font-size:15px;line-height:1.5;color:${theme.ink};word-wrap:break-word;overflow-wrap:anywhere;`;

const labelOf = (
  options: { label: string; value: string }[],
  stored?: string | null,
) => options.find((option) => option.value === stored)?.label ?? stored ?? "";

const nameOf = (relation: unknown) =>
  relation && typeof relation === "object" && "name" in relation
    ? String(relation.name)
    : "";

/** Date and time in the city's own time zone, as the calendar shows them. */
function when(event: Event) {
  const city = typeof event.city === "object" ? event.city : null;
  const timeZone = city?.timezone || "UTC";
  const zone = city?.timezoneLabel || timeZone;
  const day = (instant: string) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(instant));
  const time = (instant: string) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date(instant));
  if (event.allDay) return `${day(event.startAt)} · All day`;
  if (!event.endAt)
    return `${day(event.startAt)} · ${time(event.startAt)} ${zone}`;
  const sameDay = day(event.startAt) === day(event.endAt);
  return sameDay
    ? `${day(event.startAt)} · ${time(event.startAt)} to ${time(event.endAt)} ${zone}`
    : `${day(event.startAt)} ${time(event.startAt)} to ${day(event.endAt)} ${time(event.endAt)} ${zone}`;
}

/**
 * Internal alert to the Happenings team when an event is submitted. It goes only
 * to the addresses in Notification settings, so it may include the submitter's
 * private contact details. Replies go straight to the submitter.
 */
export function teamAlertTemplate({
  event,
  recipient,
  sender,
  adminUrl,
}: {
  event: Event;
  recipient: string;
  sender: string;
  adminUrl: string;
}): EmailMessage {
  const by = event.submittedBy ?? {};
  const city = nameOf(event.city);
  const title = event.title.replace(/[\r\n]/g, " ");
  const industry = [
    labelOf(INDUSTRIES, event.industry),
    labelOf(INDUSTRIES, event.secondaryIndustry),
  ]
    .filter(Boolean)
    .join(" · ");
  const seasons = (event.seasons ?? []).map(nameOf).filter(Boolean).join(", ");
  const organiser = event.submittedOrganiser?.name || nameOf(event.organiser);
  const venue = [
    event.submittedVenue?.name || nameOf(event.venue),
    event.submittedVenue?.area,
  ]
    .filter(Boolean)
    .join(", ");

  const details: [string, string][] = [
    ["City", city],
    ["When", when(event)],
    [
      "Type · Industry",
      [labelOf(EVENT_TYPES, event.eventType), industry]
        .filter(Boolean)
        .join(" · "),
    ],
    ["Access", labelOf(ACCESS_OPTIONS, event.access)],
    ["Visibility", labelOf(VISIBILITY_OPTIONS, event.visibility)],
    ["In the diary", seasons],
    ["Organiser", organiser],
    ["Venue", venue],
    ["Link", event.actionUrl ?? ""],
    ["Description", event.description ?? ""],
  ];
  const submitter: [string, string][] = [
    ["Name", by.name ?? ""],
    ["Role", [by.role, by.organisation].filter(Boolean).join(", ")],
    ["Relationship", labelOf(SUBMITTER_RELATIONSHIPS, by.relationship)],
    ["Email", by.email ?? ""],
    ["Phone or WhatsApp", by.phone ?? ""],
  ];
  const filled = (rows: [string, string][]) => rows.filter(([, text]) => text);
  const table = (rows: [string, string][]) =>
    filled(rows)
      .map(
        ([key, text]) =>
          `<tr><td valign="top" width="34%" style="${label()}padding:10px 12px 10px 0;border-top:1px solid rgba(26,26,26,0.15)">${escapeHtml(key)}</td><td valign="top" style="${value}padding:10px 0;border-top:1px solid rgba(26,26,26,0.15)">${escapeHtml(text)}</td></tr>`,
      )
      .join("");
  const plain = (rows: [string, string][]) =>
    filled(rows)
      .map(([key, text]) => `${key}: ${text}`)
      .join("\n");
  const subject = `New submission: ${title}${city ? ` · ${city}` : ""}`;

  return {
    from: `${SITE_NAME} <${sender}>`,
    to: recipient,
    ...(by.email ? { replyTo: by.email } : {}),
    subject,
    text: `New submission on ${SITE_NAME}\n\n${title}\n\n${plain(details)}\n\nSubmitted by\n${plain(submitter)}\n\nReview in admin: ${adminUrl}\n\nReply to this email to contact the submitter.`,
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:${theme.cream}">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${theme.cream}" style="width:100%;background:${theme.cream};border-collapse:collapse">
      <tr><td align="center" style="padding:24px 12px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;table-layout:fixed">
          <tr><td bgcolor="${theme.red}" style="background:${theme.red};padding:24px 28px 28px">
            <p style="${label(theme.white)}margin:0 0 16px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${theme.white};margin-right:8px;vertical-align:middle"></span>New submission · Awaiting review</p>
            <h1 style="font-family:${sansFont};font-size:28px;line-height:1.1;font-weight:500;text-transform:uppercase;color:${theme.white};margin:0;word-wrap:break-word;overflow-wrap:anywhere">${escapeHtml(title)}</h1>
          </td></tr>
          <tr><td bgcolor="${theme.white}" style="background:${theme.white};padding:24px 28px 28px">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;table-layout:fixed;margin:0 0 24px">${table(details)}</table>
            <p style="${label(theme.red)}margin:0 0 4px">Submitted by</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;table-layout:fixed;margin:0 0 28px">${table(submitter)}</table>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 16px"><tr><td bgcolor="${theme.red}" style="background:${theme.red}"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:14px 24px;${label(theme.white)}font-size:13px;text-decoration:none">Review in admin</a></td></tr></table>
            <p style="${value}font-size:13px;color:${theme.muted};margin:0">Reply to this email to contact the submitter. Nothing is published until it is approved.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`,
  };
}
