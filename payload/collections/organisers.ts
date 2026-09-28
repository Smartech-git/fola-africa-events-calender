import type { CollectionConfig } from "payload";

import { staffAccess } from "@/payload/access";
import { ORGANISER_TYPES } from "@/payload/constants";
import { slugField } from "@/payload/fields/slug-field";
import { httpURL } from "@/payload/validation";

export const organisers: CollectionConfig = {
  slug: "organisers",
  admin: {
    useAsTitle: "name",
    group: "Calendar",
    defaultColumns: ["name", "type", "isDemo"],
  },
  access: staffAccess,
  fields: [
    { name: "name", type: "text", required: true, index: true },
    slugField("name"),
    {
      name: "type",
      type: "select",
      required: true,
      options: ORGANISER_TYPES,
    },
    { name: "website", type: "text", validate: httpURL },
    {
      name: "contact",
      type: "group",
      admin: {
        description: "Internal only. Never included in public event responses.",
      },
      fields: [
        { name: "name", type: "text" },
        { name: "email", type: "email" },
        { name: "phone", type: "text" },
      ],
    },
    {
      name: "isDemo",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
  ],
};
