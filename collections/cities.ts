import { APIError, type CollectionConfig } from "payload";

import { CITIES } from "../lib/calendar/constants";
import { noAccess } from "../lib/calendar/access";

export const Cities: CollectionConfig = {
  slug: "cities",
  admin: {
    useAsTitle: "name",
    group: "Calendar",
    description: "Fixed beta lookup. Managed by the seed script.",
  },
  access: {
    read: () => true,
    create: noAccess,
    update: noAccess,
    delete: noAccess,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        const city = CITIES.find((entry) => entry.slug === data?.slug);
        if (!city)
          throw new APIError("Only the six beta cities are supported.", 400);
        return { ...data, ...city };
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "country", type: "text", required: true },
    { name: "timezone", type: "text", required: true },
    { name: "timezoneLabel", type: "text", required: true },
  ],
};
