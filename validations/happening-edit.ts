import * as z from "zod";

import {
  ACCESS_OPTIONS,
  EVENT_TYPES,
  INDUSTRIES,
  LINK_REQUIRED_ACCESS,
  PRIVATE_ACCESS,
  VISIBILITY_OPTIONS,
  DESCRIPTION_MAX_WORDS,
} from "@/payload/constants";
import { shortDescription } from "@/payload/validation";
import type { Event } from "@/payload-types";
import {
  actionLink,
  choice,
  dateTime,
  id,
  instagram,
  optionalEmail,
  requiredText,
  text,
  url,
} from "@/validations/submit-event";

/**
 * What a member may change on their own happening (Figma: 13 — Edit Happening).
 * City and organiser are locked: they decide the listing's calendar and record.
 */
export const editHappeningSchema = z
  .object({
    title: requiredText,
    startAt: dateTime,
    endAt: z.union([z.literal(""), dateTime]),
    allDay: z.boolean(),
    industry: choice<Event["industry"]>(INDUSTRIES),
    eventType: choice<Event["eventType"]>(EVENT_TYPES),
    description: z
      .string()
      .trim()
      .max(4000)
      .refine(
        (value) => shortDescription(value) === true,
        `Use no more than ${DESCRIPTION_MAX_WORDS} words.`,
      ),
    venueName: text,
    venueArea: text,
    venueAddress: z.string().trim().max(1000),
    access: choice<Event["access"]>(ACCESS_OPTIONS),
    actionUrl: actionLink,
    visibility: choice<Event["visibility"]>(VISIBILITY_OPTIONS),
    eventWebsite: url,
    instagram,
    publicContactEmail: optionalEmail,
    // A media ID: the current artwork, a new upload, or "" for none.
    artwork: z.union([z.literal(""), id]),
    artworkRights: z.boolean(),
    // Optional context for the team, sent with changes to a live listing.
    note: z.string().trim().max(1000),
  })
  .strict()
  .superRefine((data, ctx) => {
    const issue = (path: keyof typeof data, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });
    if (data.endAt && data.endAt <= data.startAt)
      issue("endAt", "End time must be later than start time.");
    if (LINK_REQUIRED_ACCESS.includes(data.access) && !data.actionUrl)
      issue(
        "actionUrl",
        "Ticketed, registration and RSVP happenings need a link.",
      );
    if (PRIVATE_ACCESS.includes(data.access) && data.actionUrl)
      issue(
        "actionUrl",
        "Private and invitation-only events cannot have a public link.",
      );
    if (data.visibility === "held-date" && data.access !== "private")
      issue("access", "Held dates must use Private access.");
    if (!data.venueName && (data.venueArea || data.venueAddress))
      issue("venueName", "Add a venue name for these venue details.");
  });

export type EditHappeningValues = z.infer<typeof editHappeningSchema>;

/** Fields that count as a change, with the label the member and team see. */
export const EDITABLE_FIELDS: {
  name: Exclude<keyof EditHappeningValues, "artworkRights" | "note">;
  label: string;
}[] = [
  { name: "title", label: "Event name" },
  { name: "startAt", label: "Start" },
  { name: "endAt", label: "End" },
  { name: "allDay", label: "All day" },
  { name: "industry", label: "Industry" },
  { name: "eventType", label: "Event type" },
  { name: "description", label: "Description" },
  { name: "venueName", label: "Venue" },
  { name: "venueArea", label: "Area" },
  { name: "venueAddress", label: "Full address" },
  { name: "access", label: "Who can attend" },
  { name: "actionUrl", label: "Ticket or RSVP link" },
  { name: "visibility", label: "What Happenings shows" },
  { name: "eventWebsite", label: "Website" },
  { name: "instagram", label: "Instagram" },
  { name: "publicContactEmail", label: "Public contact email" },
  { name: "artwork", label: "Artwork" },
];

export const cancelHappeningSchema = z.object({
  note: z.string().trim().max(1000),
});
