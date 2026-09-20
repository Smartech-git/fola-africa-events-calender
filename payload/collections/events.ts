import type { CollectionConfig } from "payload";

import { isStaff, noAccess } from "../access";
import {
  ACCESS_OPTIONS,
  EVENT_STATUSES,
  EVENT_TYPES,
  INDUSTRIES,
  VISIBILITY_OPTIONS,
} from "../constants";
import { queueEventReview, validateEvent } from "../event-hooks";
import { httpURL, shortDescription } from "../validation";

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
      "All entries start Submitted. Complete review, approve, then publish in separate saves. Content changes require reapproval.",
  },
  // Raw records and counts stay private. Public callers use the whitelisted calendar projection.
  access: {
    create: isStaff,
    read: isStaff,
    update: isStaff,
    delete: noAccess,
    readVersions: isStaff,
  },
  versions: { maxPerDoc: 30 },
  indexes: [{ fields: ["city", "status", "startAt"] }],
  hooks: { beforeChange: [validateEvent], afterChange: [queueEventReview] },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
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
        description: "Enter with a timezone offset. Stored as UTC.",
        date: { pickerAppearance: "dayAndTime", timeFormat: "HH:mm" },
      },
    },
    {
      name: "endAt",
      type: "date",
      admin: { date: { pickerAppearance: "dayAndTime", timeFormat: "HH:mm" } },
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
      required: true,
    },
    {
      name: "venue",
      type: "relationship",
      relationTo: "venues",
      filterOptions: ({ data }) => ({ city: { equals: data.city } }),
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
          options: [
            { label: "Organiser", value: "organiser" },
            { label: "PR / authorised representative", value: "pr" },
            { label: "Venue", value: "venue" },
            { label: "Other", value: "other" },
          ],
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
