import type { CollectionConfig } from "payload";

import { staffAccess } from "../access";
import { httpURL } from "../validation";

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
    { name: "slug", type: "text", required: true, unique: true },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        "brand",
        "label",
        "gallery",
        "promoter",
        "institution",
        "individual",
      ],
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
