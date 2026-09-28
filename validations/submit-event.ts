import { parseDateTime } from "@internationalized/date";
import * as z from "zod";

import {
  ACCESS_OPTIONS,
  EVENT_TYPES,
  INDUSTRIES,
  ORGANISER_TYPES,
  PRIVATE_ACCESS,
  SUBMITTER_RELATIONSHIPS,
  VISIBILITY_OPTIONS,
} from "@/payload/constants";
import { httpURL, shortDescription } from "@/payload/validation";
import type { Event, Organiser } from "@/payload-types";

const text = z.string().trim().max(200);
const requiredText = text.min(1, "This field is required.");
const url = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (value) => httpURL(value) === true,
    "Enter an HTTP or HTTPS URL without embedded credentials.",
  );
const id = z.string().regex(/^[1-9]\d*$/, "Select an option.");
const choice = <T extends string>(options: { value: string }[]) =>
  z.custom<T>(
    (value) =>
      typeof value === "string" &&
      options.some((option) => option.value === value),
    "Select an option.",
  );
const dateTime = z.string().refine((value) => {
  try {
    return (
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) &&
      parseDateTime(value).toString() === `${value}:00`
    );
  } catch {
    return false;
  }
}, "Enter a valid date and time.");

export const submitEventSchema = z
  .object({
    title: requiredText,
    city: id,
    startAt: dateTime,
    endAt: z.union([z.literal(""), dateTime]),
    allDay: z.boolean(),
    eventType: choice<Event["eventType"]>(EVENT_TYPES),
    industry: choice<Event["industry"]>(INDUSTRIES),
    secondaryIndustry: z.union([
      z.literal(""),
      choice<NonNullable<Event["secondaryIndustry"]>>(INDUSTRIES),
    ]),
    access: choice<Event["access"]>(ACCESS_OPTIONS),
    visibility: choice<Event["visibility"]>(VISIBILITY_OPTIONS),
    actionUrl: url,
    organiserName: requiredText,
    organiserType: choice<Organiser["type"]>(ORGANISER_TYPES),
    organiserWebsite: url,
    organiserContact: z
      .string()
      .trim()
      .email("Enter a valid organiser email.")
      .max(254),
    venueName: text,
    venueArea: text,
    venueAddress: z.string().trim().max(1000),
    venueMapUrl: url,
    description: z
      .string()
      .trim()
      .max(4000)
      .refine(
        (value) => shortDescription(value) === true,
        "Use no more than 60 words.",
      ),
    seasons: z.array(id).max(20),
    submitterName: requiredText,
    submitterEmail: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .max(254),
    relationship: choice<
      NonNullable<NonNullable<Event["submittedBy"]>["relationship"]>
    >(SUBMITTER_RELATIONSHIPS),
    agreement: z
      .boolean()
      .refine(
        Boolean,
        "Confirm that you are authorised to share these details.",
      ),
    website: z.string().max(0, "Unable to submit this form."),
  })
  .strict()
  .superRefine((data, ctx) => {
    const issue = (path: keyof typeof data, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });
    if (data.endAt && data.endAt <= data.startAt)
      issue("endAt", "End time must be later than start time.");
    if (["tickets", "rsvp"].includes(data.access) && !data.actionUrl)
      issue("actionUrl", "Tickets and RSVP require an action URL.");
    if (PRIVATE_ACCESS.includes(data.access)) {
      if (data.actionUrl)
        issue(
          "actionUrl",
          "Private and invitation-only events cannot have an action URL.",
        );
      if (!["organiser", "pr"].includes(data.relationship))
        issue(
          "relationship",
          "Only the organiser or their representative may submit a private event.",
        );
    }
    if (data.visibility === "held-date" && data.access !== "private")
      issue("access", "Held dates must use Private access.");
    if (data.secondaryIndustry && data.secondaryIndustry === data.industry)
      issue("secondaryIndustry", "Choose a different secondary industry.");
    if (
      !data.venueName &&
      (data.venueArea || data.venueAddress || data.venueMapUrl)
    )
      issue("venueName", "Add a venue name for these venue details.");
  });

export type SubmitEventValues = z.infer<typeof submitEventSchema>;

export const submitEventDefaults: Partial<SubmitEventValues> = {
  title: "",
  city: "",
  startAt: "",
  endAt: "",
  allDay: false,
  eventType: undefined,
  industry: undefined,
  secondaryIndustry: "",
  access: undefined,
  visibility: "public",
  actionUrl: "",
  organiserName: "",
  organiserType: undefined,
  organiserWebsite: "",
  organiserContact: "",
  venueName: "",
  venueArea: "",
  venueAddress: "",
  venueMapUrl: "",
  description: "",
  seasons: [],
  submitterName: "",
  submitterEmail: "",
  relationship: undefined,
  agreement: false,
  website: "",
};
