import type { CollectionConfig, Where } from "payload";

import { adminField, isAdmin, isStaff } from "@/payload/access";
import {
  ACCESS_OPTIONS,
  EVENT_STATUSES,
  EVENT_TYPES,
  INDUSTRIES,
  ORGANISER_TYPES,
  SUBMITTER_RELATIONSHIPS,
  VISIBILITY_OPTIONS,
} from "@/payload/constants";
import {
  queueEventEmail,
  queueTeamAlert,
} from "@/payload/emails/event-email-task";
import {
  deleteEventReviews,
  queueEventReview,
  validateEvent,
} from "@/payload/event-hooks";
import { slugField } from "@/payload/fields/slug-field";
import {
  actionLink,
  approvalDecision,
  httpURL,
  normalizeActionURL,
  normalizeWebURL,
  instagramURL,
  shortDescription,
} from "@/payload/validation";

export const events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "title",
    group: "Calendar",
    defaultColumns: [
      "title",
      "city",
      "startAt",
      "status",
      "visibility",
      "isDemo",
    ],
    description:
      "Public submissions get one AI review when received, then need administrator approval. Choose existing organiser/venue records or create them from the submitted details on approval. Publishing records approval too. Content changes require reapproval.",
    components: {
      beforeListTable: ["@/payload/components/events-metrics#EventsMetrics"],
    },
  },
  // Raw records and counts stay private. Public callers use the whitelisted calendar projection.
  access: {
    create: isStaff,
    read: isStaff,
    update: isStaff,
    delete: isAdmin,
    readVersions: isStaff,
  },
  versions: { maxPerDoc: 3 },
  indexes: [{ fields: ["city", "status", "startAt"] }],
  hooks: {
    beforeChange: [validateEvent],
    afterChange: [queueEventReview, queueEventEmail, queueTeamAlert],
    beforeDelete: [deleteEventReviews],
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField("title"),
    {
      name: "city",
      type: "relationship",
      relationTo: "cities",
      required: true,
      index: true,
    },
    {
      name: "startAt",
      type: "date",
      required: true,
      index: true,
      admin: {
        components: {
          Field: "@/payload/components/city-date-input#CityDateInput",
        },
        date: { pickerAppearance: "dayAndTime", timeFormat: "h:mm a" },
      },
    },
    {
      name: "endAt",
      type: "date",
      admin: {
        components: {
          Field: "@/payload/components/city-date-input#CityDateInput",
        },
        date: { pickerAppearance: "dayAndTime", timeFormat: "h:mm a" },
      },
    },
    { name: "allDay", type: "checkbox", defaultValue: false },
    {
      name: "industry",
      type: "select",
      required: true,
      options: INDUSTRIES,
      index: true,
    },
    {
      name: "secondaryIndustry",
      type: "select",
      options: INDUSTRIES,
      index: true,
    },
    { name: "eventType", type: "select", required: true, options: EVENT_TYPES },
    {
      name: "access",
      type: "select",
      required: true,
      options: ACCESS_OPTIONS,
      index: true,
    },
    {
      name: "visibility",
      type: "select",
      required: true,
      defaultValue: "public",
      options: VISIBILITY_OPTIONS,
    },
    {
      name: "actionUrl",
      type: "text",
      validate: actionLink,
      hooks: { beforeValidate: [normalizeActionURL] },
      admin: {
        description:
          "Ticket, registration or RSVP link, or an email address (saved as a mailto: link). Required for Ticketed, Registration required and RSVP required.",
      },
    },
    {
      name: "website",
      type: "text",
      validate: httpURL,
      hooks: { beforeValidate: [normalizeWebURL] },
      admin: { description: "Shown on Full listings only." },
    },
    {
      name: "instagram",
      type: "text",
      validate: instagramURL,
      admin: { description: "Shown on Full listings only." },
    },
    {
      name: "publicContactEmail",
      type: "email",
      admin: {
        description:
          "Public event contact. Shown on Full listings only; never use a private address here.",
      },
    },
    {
      name: "organiser",
      type: "relationship",
      relationTo: "organisers",
      filterOptions: { isDemo: { not_equals: true } },
      admin: {
        description:
          "Choose an existing organiser after reviewing possible AI matches, or create one here. Required before approval for manually entered events.",
      },
    },
    {
      name: "venue",
      type: "relationship",
      relationTo: "venues",
      filterOptions: ({ data }): Where => ({
        and: [
          { city: { equals: data.city } },
          { isDemo: { not_equals: true } },
        ],
      }),
      admin: {
        description: "Choose a venue in this city, or create one here.",
      },
    },
    {
      name: "submittedOrganiser",
      label: "Submitted organiser details",
      type: "group",
      access: { update: adminField },
      admin: {
        condition: (data) => data.source === "submission",
        description:
          "Private submitted details. No organiser record is created until administrator approval. Editing these details requires reapproval.",
      },
      fields: [
        { name: "name", type: "text" },
        { name: "type", type: "select", options: ORGANISER_TYPES },
        {
          name: "website",
          type: "text",
          validate: httpURL,
          hooks: { beforeValidate: [normalizeWebURL] },
        },
        { name: "contactEmail", type: "email" },
      ],
    },
    {
      name: "organiserResolution",
      label: "Organiser decision",
      type: "select",
      access: { create: adminField, update: adminField },
      validate: approvalDecision("organiser"),
      options: [
        { label: "Use the selected existing organiser", value: "use-existing" },
        { label: "Update an existing organiser…", value: "update-existing" },
        {
          label: "Create from submitted details on approval",
          value: "create-new",
        },
      ],
      admin: {
        condition: (data) => Boolean(data.submittedOrganiser?.name),
        description: "Required before approval or publication.",
        components: {
          Field: {
            path: "@/payload/components/relation-resolution#RelationResolution",
            clientProps: { relation: "organiser" },
          },
        },
      },
    },
    {
      name: "organiserUpdate",
      type: "json",
      access: { create: adminField, update: adminField },
      admin: {
        components: {
          Field: "@/payload/components/relation-resolution#RelationUpdateData",
        },
      },
    },
    {
      name: "submittedVenue",
      label: "Submitted venue details",
      type: "group",
      access: { update: adminField },
      admin: {
        condition: (data) => data.source === "submission",
        description:
          "Private submitted details. Match a venue in this city or create it on approval. Editing these details requires reapproval.",
      },
      fields: [
        { name: "name", type: "text" },
        { name: "area", type: "text" },
        { name: "address", type: "textarea" },
        {
          name: "mapUrl",
          type: "text",
          validate: httpURL,
          hooks: { beforeValidate: [normalizeWebURL] },
        },
      ],
    },
    {
      name: "venueResolution",
      label: "Venue decision",
      type: "select",
      access: { create: adminField, update: adminField },
      validate: approvalDecision("venue"),
      options: [
        { label: "Use the selected existing venue", value: "use-existing" },
        { label: "Update an existing venue…", value: "update-existing" },
        {
          label: "Create from submitted details on approval",
          value: "create-new",
        },
        { label: "Leave the venue off this event", value: "omit" },
      ],
      admin: {
        condition: (data) => Boolean(data.submittedVenue?.name),
        description: "Required before approval or publication.",
        components: {
          Field: {
            path: "@/payload/components/relation-resolution#RelationResolution",
            clientProps: { relation: "venue" },
          },
        },
      },
    },
    {
      name: "venueUpdate",
      type: "json",
      access: { create: adminField, update: adminField },
      admin: {
        components: {
          Field: "@/payload/components/relation-resolution#RelationUpdateData",
        },
      },
    },
    {
      name: "seasons",
      type: "relationship",
      relationTo: "seasons",
      hasMany: true,
      filterOptions: ({ data }) => ({ city: { equals: data.city } }),
    },
    { name: "description", type: "textarea", validate: shortDescription },
    {
      name: "artwork",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Shown on the event page for Full listings only, never in list views. Replacing it on a live listing needs approval again.",
      },
    },
    {
      name: "artworkRightsConfirmedAt",
      label: "Artwork rights confirmed",
      type: "date",
      access: { create: () => false, update: () => false },
      admin: {
        readOnly: true,
        condition: (data) => Boolean(data.artworkRightsConfirmedAt),
        description:
          "When the submitter confirmed they have the right to share the artwork.",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "submitted",
      options: EVENT_STATUSES,
      index: true,
      admin: { position: "sidebar" },
    },
    {
      name: "verified",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description:
          "Mark only after direct organiser confirmation. Demo data is never verified.",
      },
    },
    { name: "organiserConfirmed", type: "checkbox", defaultValue: false },
    {
      name: "organiserConfirmedBy",
      type: "relationship",
      relationTo: "users",
      access: { create: () => false, update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "organiserConfirmedAt",
      type: "date",
      access: { create: () => false, update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "approvedBy",
      type: "relationship",
      relationTo: "users",
      access: { create: () => false, update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "approvedAt",
      type: "date",
      access: { create: () => false, update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "publishedAt",
      type: "date",
      access: { create: () => false, update: () => false },
      admin: { readOnly: true },
    },
    {
      name: "source",
      type: "select",
      required: true,
      defaultValue: "fola",
      options: [
        { label: "FOLA entry", value: "fola" },
        { label: "Public submission", value: "submission" },
        { label: "CSV import", value: "csv" },
        { label: "Demo fixture", value: "demo" },
      ],
      // Only the website form creates public submissions (with their AI
      // review), so staff never see it as a choice for their own entries.
      filterOptions: ({ data, options }) =>
        data?.source === "submission"
          ? options
          : options.filter(
              (option) =>
                (typeof option === "string" ? option : option.value) !==
                "submission",
            ),
      admin: {
        description:
          "Public submission is set only by the website form. Assigning a member does not need it.",
      },
    },
    {
      name: "sourceUrl",
      type: "text",
      validate: httpURL,
      hooks: { beforeValidate: [normalizeWebURL] },
    },
    {
      name: "submitterEditedAt",
      label: "Edited by the submitter",
      type: "date",
      access: { create: () => false, update: () => false },
      admin: {
        position: "sidebar",
        readOnly: true,
        condition: (data) => Boolean(data.submitterEditedAt),
        description:
          "The submitter changed this after the AI review. Compare with the review’s original listing before approving.",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      name: "member",
      label: "Submitted by member",
      type: "relationship",
      relationTo: "members",
      index: true,
      // Set by the member submission flow. Administrators may assign it, e.g.
      // for an event a member sent by email; it hands the member control.
      access: { create: adminField, update: adminField },
      filterOptions: { status: { equals: "active" } },
      admin: {
        position: "sidebar",
        allowCreate: false,
        description:
          "The Happenings account that submitted this event. The member sees it in their account and can withdraw, cancel or postpone it and request changes.",
      },
    },
    {
      name: "submittedBy",
      type: "group",
      admin: {
        description:
          "Private contact details. Never exposed on the public calendar.",
      },
      fields: [
        { name: "name", type: "text" },
        { name: "email", type: "email" },
        { name: "phone", label: "Phone or WhatsApp", type: "text" },
        { name: "organisation", type: "text" },
        { name: "role", label: "Job title or role", type: "text" },
        {
          name: "relationship",
          type: "select",
          options: SUBMITTER_RELATIONSHIPS,
        },
      ],
    },
    {
      name: "isDemo",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    { name: "reviews", type: "join", collection: "event-reviews", on: "event" },
  ],
};
