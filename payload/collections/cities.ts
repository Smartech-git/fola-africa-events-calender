import type { CollectionConfig } from "payload";

import { isStaff, noAccess } from "@/payload/access";
import { slugField } from "@/payload/fields/slug-field";

export const cities: CollectionConfig = {
  slug: "cities",
  admin: {
    useAsTitle: "name",
    group: "Calendar",
    description:
      "Add cities and update their names, countries and local time zones. The seeded cities are starter data.",
  },
  access: {
    read: () => true,
    create: isStaff,
    update: isStaff,
    delete: noAccess,
  },
  fields: [
    { name: "name", type: "text", required: true },
    slugField("name"),
    { name: "country", type: "text", required: true },
    { name: "timezone", type: "text", required: true },
    { name: "timezoneLabel", type: "text", required: true },
  ],
};
