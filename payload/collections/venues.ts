import type { CollectionConfig } from "payload";

import { staffAccess } from "../access";
import { httpURL } from "../validation";

export const venues: CollectionConfig = {
  slug: "venues",
  admin: {
    useAsTitle: "name",
    group: "Calendar",
    defaultColumns: ["name", "city", "area"],
  },
  access: staffAccess,
  fields: [
    { name: "name", type: "text", required: true, index: true },
    { name: "slug", type: "text", required: true, unique: true },
    {
      name: "city",
      type: "relationship",
      relationTo: "cities",
      required: true,
      index: true,
    },
    { name: "area", type: "text" },
    { name: "address", type: "textarea" },
    { name: "mapUrl", type: "text", validate: httpURL },
    {
      name: "isDemo",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
  ],
};
