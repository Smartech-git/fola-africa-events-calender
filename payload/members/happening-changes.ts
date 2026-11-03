import { parseDateTime, toZoned } from "@internationalized/date";
import {
  APIError,
  type CollectionAfterChangeHook,
  type PayloadRequest,
} from "payload";

import { SITE_NAME } from "@/constants/brand";
import {
  changedFields,
  displayValue,
  fieldLabel,
  type HappeningField,
  type HappeningValues,
} from "@/lib/account/happening-fields";
import { PRIVATE_ACCESS } from "@/payload/constants";
import { emailSettings, emailSiteUrl } from "@/payload/emails/email-settings";
import {
  queueNotification,
  teamRecipients,
} from "@/payload/emails/event-email-task";
import { happeningUpdateTemplate } from "@/payload/emails/happening-update-template";
import { instagramProfile, relationID } from "@/payload/validation";
import type { City, Event, EventChange, Member } from "@/payload-types";

/** Pass in `context` when an approved change request is applied to an event. */
export const APPLYING_CHANGE_REQUEST = "applyingChangeRequest";
/** Pass in `context` for a member cancelling, postponing or withdrawing their own happening. */
export const MEMBER_STATUS_CHANGE = "memberStatusChange";

export type { HappeningValues };
type FieldName = HappeningField;

const cityOf = (event: Event) =>
  event.city && typeof event.city === "object" ? (event.city as City) : null;

/** An instant as the wall time in the city, e.g. "2026-12-18T10:00". */
export function cityTime(iso: string | null | undefined, timeZone: string) {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

/** A city wall time back to an instant; throws when the time does not exist there. */
export function cityInstant(value: string, timeZone: string) {
  return toZoned(parseDateTime(value), timeZone, "reject")
    .toDate()
    .toISOString();
}

/** The event as the edit form's values. Load it with city, venue and artwork populated. */
export function happeningValues(event: Event): HappeningValues {
  const timeZone = cityOf(event)?.timezone ?? "UTC";
  const venue =
    event.venue && typeof event.venue === "object" ? event.venue : null;
  return {
    title: event.title,
    startAt: cityTime(event.startAt, timeZone),
    endAt: cityTime(event.endAt, timeZone),
    allDay: Boolean(event.allDay),
    industry: event.industry,
    eventType: event.eventType,
    description: event.description ?? "",
    venueName: venue?.name ?? event.submittedVenue?.name ?? "",
    venueArea: venue?.area ?? event.submittedVenue?.area ?? "",
    venueAddress: venue?.address ?? event.submittedVenue?.address ?? "",
    access: event.access,
    actionUrl: event.actionUrl ?? "",
    visibility: event.visibility,
    eventWebsite: event.website ?? "",
    instagram: event.instagram ?? "",
    publicContactEmail: event.publicContactEmail ?? "",
    artwork: event.artwork ? String(relationID(event.artwork)) : "",
  };
}

export { changedFields, displayValue, fieldLabel };

const venueFields = ["venueName", "venueArea", "venueAddress"];

/**
 * Event data for the given values. Times are read in the event's city. For a
 * submission still under review the venue stays as submitted details; for a
 * live listing the reviewer picks the venue record when approving.
 */
export function eventData(
  values: Partial<HappeningValues>,
  timeZone: string,
  { submission }: { submission: boolean },
) {
  const data: Record<string, unknown> = {};
  const has = (name: FieldName) => name in values;
  if (has("title")) data.title = values.title;
  if (has("startAt")) data.startAt = cityInstant(values.startAt!, timeZone);
  if (has("endAt"))
    data.endAt = values.endAt ? cityInstant(values.endAt, timeZone) : null;
  if (has("allDay")) data.allDay = values.allDay;
  if (has("industry")) data.industry = values.industry;
  if (has("eventType")) data.eventType = values.eventType;
  if (has("description")) data.description = values.description;
  if (has("access")) data.access = values.access;
  if (has("actionUrl")) data.actionUrl = values.actionUrl || null;
  if (has("visibility")) data.visibility = values.visibility;
  if (has("eventWebsite")) data.website = values.eventWebsite || null;
  if (has("instagram"))
    data.instagram = values.instagram
      ? (instagramProfile(values.instagram) ?? null)
      : null;
  if (has("publicContactEmail"))
    data.publicContactEmail = values.publicContactEmail
      ? values.publicContactEmail.toLowerCase()
      : null;
  if (has("artwork")) {
    data.artwork = values.artwork ? Number(values.artwork) : null;
    if (values.artwork)
      data.artworkRightsConfirmedAt = new Date().toISOString();
  }
  if (submission && venueFields.some((name) => name in values))
    data.submittedVenue = values.venueName
      ? {
          name: values.venueName,
          area: values.venueArea,
          address: values.venueAddress,
        }
      : null;
  return data;
}

/** Copies an approved change request onto its event. Runs inside the decision's save. */
export async function applyChangeRequest(
  request: Partial<EventChange>,
  req: PayloadRequest,
) {
  const eventId = relationID(request.event);
  if (!eventId) throw new APIError("This change request has no event.", 400);
  const event = await req.payload.findByID({
    collection: "events",
    id: eventId,
    depth: 1,
    req,
    overrideAccess: true,
  });
  const city = cityOf(event);
  if (!city) throw new APIError("The event has no city.", 400);
  const changes = (request.changes ?? {}) as Partial<HappeningValues>;
  const data = eventData(changes, city.timezone, { submission: false });

  if (venueFields.some((name) => name in changes)) {
    if (!changes.venueName) data.venue = null;
    else if (!request.venueRecord)
      throw new APIError(
        "The venue changed: choose the venue record before approving.",
        400,
      );
    else data.venue = relationID(request.venueRecord);
  }
  const becomesPrivate =
    changes.access &&
    PRIVATE_ACCESS.includes(changes.access) &&
    !PRIVATE_ACCESS.includes(event.access);
  if (becomesPrivate) {
    if (!request.organiserConfirmed)
      throw new APIError(
        "Confirm the private listing with the organiser before approving.",
        400,
      );
    data.organiserConfirmed = true;
  }
  // Option 1: a postponed happening with a new date goes back on the calendar.
  if (event.status === "postponed" && "startAt" in changes)
    data.status = "published";

  await req.payload.update({
    collection: "events",
    id: eventId,
    data,
    req,
    depth: 0,
    overrideAccess: true,
    context: { [APPLYING_CHANGE_REQUEST]: true },
  });
  if (data.artwork)
    await req.payload.update({
      collection: "media",
      id: data.artwork as number,
      req,
      depth: 0,
      overrideAccess: true,
      data: { alt: `Artwork for ${changes.title ?? event.title}` },
    });
}

// ---------------------------------------------------------------------------
// Emails. Messages are written when queued and sent by the event-email job.

const sender = () => emailSettings()?.sender;
const accountUrl = () => new URL("/account/happenings", emailSiteUrl()).href;
const adminUrl = (collection: string, id: number) =>
  new URL(`/admin/collections/${collection}/${id}`, emailSiteUrl()).href;
const CONTACT = "hello@happeningsofafrica.com";

type ChangeSet = Pick<EventChange, "changes" | "previous">;
type Person = Pick<Member, "fullName" | "email">;

function changeRows(request: ChangeSet) {
  const changes = (request.changes ?? {}) as Record<string, unknown>;
  const previous = (request.previous ?? {}) as Record<string, unknown>;
  return Object.keys(changes).map((name) => ({
    label: fieldLabel(name),
    before: displayValue(name as FieldName, previous[name]),
    value: displayValue(name as FieldName, changes[name]),
  }));
}

/** To the team: a member changed their live happening. */
export function changesSubmittedMessage(args: {
  to: string;
  sender: string;
  title: string;
  member: Person;
  request: ChangeSet & Pick<EventChange, "note">;
  reviewUrl: string;
}) {
  return happeningUpdateTemplate({
    to: args.to,
    sender: args.sender,
    subject: `Changes to review: ${args.title}`,
    kicker: "Changes submitted",
    heading: "Changes to review",
    paragraphs: [
      `${args.member.fullName} (${args.member.email}) changed their live happening. The current version stays on the calendar until you approve.`,
      ...(args.request.note ? [`Their note: “${args.request.note}”`] : []),
    ],
    title: args.title,
    status: "Live · changes pending",
    rows: changeRows(args.request),
    button: { label: "Review the changes", url: args.reviewUrl },
  });
}

/** To the member: their changes were approved or declined. */
export function changeDecisionMessage(args: {
  sender: string;
  title: string;
  member: Person;
  request: ChangeSet & Pick<EventChange, "status" | "declineReason">;
  accountUrl: string;
}) {
  const approved = args.request.status === "approved";
  return happeningUpdateTemplate({
    to: args.member.email,
    sender: args.sender,
    subject: `${approved ? "Your changes are live" : "Your changes weren’t approved"}: ${args.title}`,
    kicker: approved ? "Changes approved" : "Changes declined",
    heading: approved ? "Changes approved" : "Not approved",
    greeting: `Hello ${args.member.fullName},`,
    paragraphs: approved
      ? [`Your changes to ${args.title} are now on ${SITE_NAME}.`]
      : [
          `The Happenings team didn’t approve your changes to ${args.title}. Your listing stays as it was.`,
          `Reason: ${args.request.declineReason}`,
        ],
    title: args.title,
    status: approved ? "Live · updated" : "Live · unchanged",
    rows: changeRows(args.request),
    button: { label: "View my happenings", url: args.accountUrl },
    footnote: `Questions? Reply to this email or contact ${CONTACT}.`,
  });
}

/** Cancelled or postponed by the member: one message for the team, one for the member. */
export function statusChangeMessages(args: {
  sender: string;
  title: string;
  when: string;
  member: Person;
  status: "cancelled" | "postponed";
  note: string;
  adminUrl: string;
  accountUrl: string;
}) {
  const word = args.status === "cancelled" ? "Cancelled" : "Postponed";
  const rows = [
    { label: "Was", value: args.when },
    ...(args.status === "postponed"
      ? [{ label: "New date", value: "To be confirmed" }]
      : []),
    ...(args.note ? [{ label: "Note", value: args.note }] : []),
  ];
  return {
    team: (to: string) =>
      happeningUpdateTemplate({
        to,
        sender: args.sender,
        subject: `${word}: ${args.title}`,
        kicker: "Urgent change",
        heading: word,
        paragraphs: [
          `${args.member.fullName} (${args.member.email}) marked their happening as ${word.toLowerCase()}. The listing now shows as ${word} on the calendar.`,
        ],
        title: args.title,
        status: word,
        rows,
        button: { label: "Open the event", url: args.adminUrl },
      }),
    member: happeningUpdateTemplate({
      to: args.member.email,
      sender: args.sender,
      subject: `Your Happening is ${word.toLowerCase()}: ${args.title}`,
      kicker: word,
      heading: word,
      greeting: `Hello ${args.member.fullName},`,
      paragraphs: [
        `${args.title} now shows as ${word} on the calendar. The Happenings team has been told.`,
        ...(args.status === "postponed"
          ? [
              "When you have the new date, edit the happening and it will go back on the calendar once approved.",
            ]
          : []),
      ],
      title: args.title,
      status: word,
      rows,
      button: { label: "View my happenings", url: args.accountUrl },
      footnote: `Didn’t mean to do this? Reply to this email or contact ${CONTACT}.`,
    }),
  };
}

/** Tells the team a member submitted changes to a live happening. */
export async function queueChangesSubmittedEmails(
  req: PayloadRequest,
  event: Event,
  request: EventChange,
  member: Member,
) {
  const from = sender();
  if (!from) return;
  for (const recipient of await teamRecipients(req))
    await queueNotification(req, {
      key: `change-${request.id}-team-${recipient}`,
      eventId: event.id,
      kind: "changes",
      recipient,
      message: changesSubmittedMessage({
        to: recipient,
        sender: from,
        title: event.title,
        member,
        request,
        reviewUrl: adminUrl("event-changes", request.id),
      }),
    });
}

/** Tells the member their changes were approved or declined. */
export const queueChangeDecisionEmail: CollectionAfterChangeHook<
  EventChange
> = async ({ doc, previousDoc, operation, req }) => {
  if (
    operation !== "update" ||
    previousDoc?.status !== "pending" ||
    !["approved", "declined"].includes(doc.status)
  )
    return doc;
  const from = sender();
  const memberId = Number(relationID(doc.member));
  const eventId = Number(relationID(doc.event));
  if (!from || !memberId || !eventId) return doc;
  const [member, event] = await Promise.all([
    req.payload.findByID({
      collection: "members",
      id: memberId,
      depth: 0,
      req,
      overrideAccess: true,
      disableErrors: true,
      joins: false,
    }),
    req.payload.findByID({
      collection: "events",
      id: eventId,
      depth: 0,
      req,
      overrideAccess: true,
      disableErrors: true,
    }),
  ]);
  if (!member || !event) return doc;
  await queueNotification(req, {
    key: `change-${doc.id}-${doc.status}`,
    eventId,
    kind: doc.status === "approved" ? "changes-approved" : "changes-declined",
    recipient: member.email,
    message: changeDecisionMessage({
      sender: from,
      title: event.title,
      member,
      request: doc,
      accountUrl: accountUrl(),
    }),
  });
  return doc;
};

/** Cancelled or postponed by the member: the team at once, and a confirmation to the member. */
export async function queueStatusChangeEmails(
  req: PayloadRequest,
  event: Event,
  member: Member,
  status: "cancelled" | "postponed",
  note: string,
) {
  const from = sender();
  if (!from) return;
  const city = cityOf(event);
  const messages = statusChangeMessages({
    sender: from,
    title: event.title,
    when: city
      ? `${displayValue("startAt", cityTime(event.startAt, city.timezone))} · ${city.name}`
      : "",
    member,
    status,
    note,
    adminUrl: adminUrl("events", event.id),
    accountUrl: accountUrl(),
  });
  const stamp = Date.now();
  for (const recipient of await teamRecipients(req))
    await queueNotification(req, {
      key: `event-${event.id}-${status}-${stamp}-team-${recipient}`,
      eventId: event.id,
      kind: "urgent",
      recipient,
      message: messages.team(recipient),
    });
  await queueNotification(req, {
    key: `event-${event.id}-${status}-${stamp}-member`,
    eventId: event.id,
    kind: "status",
    recipient: member.email,
    message: messages.member,
  });
}
