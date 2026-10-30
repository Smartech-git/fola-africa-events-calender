import type { CollectionConfig, FieldAccess } from "payload";

import { adminField, isAdmin, isStaff } from "@/payload/access";
import { INDUSTRIES, MEMBER_TYPES } from "@/payload/constants";
import {
  BREVO_EXPORT_PATH,
  brevoExportHandler,
} from "@/payload/members/brevo-export";
import {
  queueBrevoRemoval,
  queueBrevoSync,
} from "@/payload/members/brevo-task";

// Sign-in secrets are only read and written by trusted server code.
const noFieldAccess: FieldAccess = () => false;
const secret = {
  access: { read: noFieldAccess, create: noFieldAccess, update: noFieldAccess },
  admin: { hidden: true },
};
const readOnlyDate = {
  type: "date",
  access: { create: noFieldAccess, update: noFieldAccess },
  admin: { readOnly: true, date: { pickerAppearance: "dayAndTime" } },
} as const;

/**
 * Public Happenings accounts. Deliberately not a Payload auth collection: the
 * admin's access rules treat any signed-in Payload user as staff, so members
 * sign in with their own session cookie (lib/auth/member-session.ts) and never
 * become `req.user`.
 */
export const members: CollectionConfig = {
  slug: "members",
  admin: {
    useAsTitle: "email",
    group: "Members",
    defaultColumns: [
      "email",
      "fullName",
      "organisation",
      "status",
      "createdAt",
    ],
    description:
      "Public Happenings accounts. Members sign in with a one-time email link and cannot open the admin. Contact details are private.",
    components: {
      beforeListTable: [
        "@/payload/components/members-metrics#MembersMetrics",
        "@/payload/components/members-brevo-export#MembersBrevoExport",
      ],
    },
  },
  endpoints: [
    { path: BREVO_EXPORT_PATH, method: "get", handler: brevoExportHandler },
  ],
  access: {
    create: isAdmin,
    read: isStaff,
    update: isAdmin,
    delete: isAdmin,
  },
  // Members who agreed to marketing are kept in step with the Brevo list.
  hooks: {
    afterChange: [queueBrevoSync],
    afterDelete: [queueBrevoRemoval],
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [({ value }) => value?.trim().toLowerCase()],
      },
      admin: {
        description:
          "Members sign in with this address. Change it only when the member asks.",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Suspended", value: "suspended" },
      ],
      access: { update: adminField },
      admin: {
        position: "sidebar",
        description:
          "Suspended members are signed out everywhere and cannot sign in.",
      },
    },
    { name: "fullName", type: "text", required: true },
    { name: "phone", label: "Phone or WhatsApp", type: "text" },
    { name: "organisation", label: "Organisation or company", type: "text" },
    { name: "role", label: "Job title or role", type: "text" },
    { name: "industry", type: "select", options: INDUSTRIES },
    { name: "city", type: "relationship", relationTo: "cities" },
    { name: "country", type: "text" },
    {
      name: "describes",
      label: "What best describes them",
      type: "select",
      options: MEMBER_TYPES,
    },
    {
      name: "marketingConsent",
      label: "Agreed to marketing emails",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "termsAcceptedAt",
      label: "Accepted the Terms and Privacy Policy",
      ...readOnlyDate,
      admin: { ...readOnlyDate.admin, position: "sidebar" },
    },
    {
      name: "marketingConsentAt",
      label: "Marketing consent given",
      ...readOnlyDate,
      admin: { ...readOnlyDate.admin, position: "sidebar" },
    },
    {
      name: "emailVerifiedAt",
      label: "Email verified",
      ...readOnlyDate,
      admin: {
        ...readOnlyDate.admin,
        position: "sidebar",
        description: "Set the first time the member signs in from their email.",
      },
    },
    {
      name: "lastSignInAt",
      label: "Last sign-in",
      ...readOnlyDate,
      admin: { ...readOnlyDate.admin, position: "sidebar" },
    },
    { name: "loginTokenHash", type: "text", index: true, ...secret },
    { name: "loginTokenIssuedAt", type: "date", ...secret },
    { name: "loginTokenExpiresAt", type: "date", ...secret },
    // Raising this signs the member out on every device.
    { name: "sessionVersion", type: "number", defaultValue: 0, ...secret },
    {
      name: "happenings",
      type: "join",
      collection: "events",
      on: "member",
      admin: { description: "Happenings this member submitted." },
    },
  ],
};
