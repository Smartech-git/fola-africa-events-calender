import type { CollectionConfig } from "payload";

import { isStaff, noAccess } from "../lib/calendar/access";

export const Cities: CollectionConfig = {
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
    { name: "slug", type: "text", required: true, unique: true },
    { name: "country", type: "text", required: true },
    { name: "timezone", type: "text", required: true },
    { name: "timezoneLabel", type: "text", required: true },
  ],
};
