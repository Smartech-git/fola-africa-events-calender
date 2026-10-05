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
import { queueEventEmail } from "@/payload/emails/event-email-task";
import {
  deleteEventReviews,
  queueEventReview,
  validateEvent,
} from "@/payload/event-hooks";
import { slugField } from "@/payload/fields/slug-field";
import { httpURL, shortDescription } from "@/payload/validation";

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
      "Public submissions require AI review and administrator approval. Choose existing organiser/venue records or create them from the submitted details on approval. Publishing records approval too. Content changes require reapproval.",
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
    afterChange: [queueEventReview, queueEventEmail],
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
    { name: "actionUrl", type: "text", validate: httpURL },
    {
      name: "organiser",
      type: "relationship",
      relationTo: "organisers",
      filterOptions: { isDemo: { not_equals: true } },
      admin: {
        description:
          "Choose an existing organiser after reviewing possible AI matches. Required before approval for manually entered events.",
        allowCreate: false,
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
      admin: { allowCreate: false },
    },
    {
      name: "submittedOrganiser",
      label: "Submitted organiser details",
      type: "group",
      access: { update: adminField },
      admin: {
        condition: (data) => data.source === "submission",
        description:
          "Private submitted details. No organiser record is created until administrator approval. Editing these details requires a new AI review.",
      },
      fields: [
        { name: "name", type: "text" },
        { name: "type", type: "select", options: ORGANISER_TYPES },
        { name: "website", type: "text", validate: httpURL },
        { name: "contactEmail", type: "email" },
      ],
    },
    {
      name: "organiserResolution",
      label: "Organiser decision",
      type: "select",
      access: { create: adminField, update: adminField },
      options: [
        { label: "Use the selected existing organiser", value: "use-existing" },
        {
          label: "Create from submitted details on approval",
          value: "create-new",
        },
      ],
      admin: { condition: (data) => Boolean(data.submittedOrganiser?.name) },
    },
    {
      name: "submittedVenue",
      label: "Submitted venue details",
      type: "group",
      access: { update: adminField },
      admin: {
        condition: (data) => data.source === "submission",
        description:
          "Private submitted details. Match a venue in this city or create it on approval. Editing these details requires a new AI review.",
      },
      fields: [
        { name: "name", type: "text" },
        { name: "area", type: "text" },
        { name: "address", type: "textarea" },
        { name: "mapUrl", type: "text", validate: httpURL },
      ],
    },
    {
      name: "venueResolution",
      label: "Venue decision",
      type: "select",
      access: { create: adminField, update: adminField },
      options: [
        { label: "Use the selected existing venue", value: "use-existing" },
        {
          label: "Create from submitted details on approval",
          value: "create-new",
        },
        { label: "Leave the venue off this event", value: "omit" },
      ],
      admin: { condition: (data) => Boolean(data.submittedVenue?.name) },
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
    },
    { name: "sourceUrl", type: "text", validate: httpURL },
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
