import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";

import { isAdmin, isStaff } from "@/payload/access";
import {
  queueSubscriberBrevoRemoval,
  queueSubscriberBrevoSync,
} from "@/payload/members/brevo-task";
import type { Subscriber } from "@/payload-types";

// Set by the hook below, whoever changes the status: the site, Brevo or staff.
const readOnlyDate = {
  type: "date",
  admin: {
    readOnly: true,
    position: "sidebar",
    date: { pickerAppearance: "dayAndTime" },
  },
} as const;

export const SUBSCRIBER_SOURCES = [
  { label: "Popup", value: "popup" },
  { label: "Admin", value: "admin" },
];

/** Dates the consent each time the status changes. */
const stampStatus: CollectionBeforeChangeHook<Subscriber> = ({
  data,
  originalDoc,
  operation,
}) => {
  const status = data.status ?? originalDoc?.status ?? "subscribed";
  if (operation === "update" && status === originalDoc?.status) return data;
  const now = new Date().toISOString();
  const created = operation === "create";
  if (status === "subscribed")
    return {
      ...data,
      consentAt: created ? (data.consentAt ?? now) : now,
      unsubscribedAt: null,
    };
  return {
    ...data,
    unsubscribedAt: created ? (data.unsubscribedAt ?? now) : now,
  };
};

/**
 * Email-only newsletter sign-ups. Submitting the form is the consent, so a
 * subscriber is always opted in until they unsubscribe. An address belongs to
 * one record only: when a member exists or later signs up with it, the
 * consent moves onto the member (payload/subscribers/subscriptions.ts).
 */
export const subscribers: CollectionConfig = {
  slug: "subscribers",
  admin: {
    useAsTitle: "email",
    group: "Members",
    defaultColumns: ["email", "status", "source", "consentAt"],
    description:
      "People who subscribed to Happenings emails with only an email address. Subscribers are synced to the Brevo list.",
    components: {
      beforeListTable: [
        "@/payload/components/subscribers-metrics#SubscribersMetrics",
      ],
    },
  },
  access: {
    create: isAdmin,
    read: isStaff,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [stampStatus],
    afterChange: [queueSubscriberBrevoSync],
    afterDelete: [queueSubscriberBrevoRemoval],
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
      index: true,
      // Fixed once created; a different address is a new subscriber.
      access: { update: () => false },
      hooks: {
        beforeValidate: [({ value }) => value?.trim().toLowerCase()],
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "subscribed",
      options: [
        { label: "Subscribed", value: "subscribed" },
        { label: "Unsubscribed", value: "unsubscribed" },
      ],
      admin: {
        position: "sidebar",
        description:
          "Unsubscribed addresses are taken off the Brevo list. Unsubscribing in Brevo sets this automatically.",
      },
    },
    {
      name: "source",
      type: "select",
      defaultValue: "admin",
      options: SUBSCRIBER_SOURCES,
      admin: { position: "sidebar", readOnly: true },
    },
    { name: "consentAt", label: "Subscribed", ...readOnlyDate },
    { name: "unsubscribedAt", label: "Unsubscribed", ...readOnlyDate },
  ],
};
