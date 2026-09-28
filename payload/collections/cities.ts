import type { CollectionConfig } from "payload";

import { isStaff, noAccess } from "@/payload/access";
import {
  cityTimezone,
  timezoneLabel,
  validTimezone,
} from "@/payload/fields/city-timezone";
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
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) return data;
        const city = { ...originalDoc, ...data };
        if (!city.timezone)
          data.timezone = cityTimezone(city.name ?? "", city.country);
        if (!city.timezoneLabel)
          data.timezoneLabel = timezoneLabel(
            data.timezone ?? city.timezone ?? "",
          );
        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    slugField("name"),
    { name: "country", type: "text", required: true },
    {
      name: "timezone",
      type: "text",
      required: true,
      validate: validTimezone,
      admin: {
        description:
          "Suggested from matching city names. Enter or correct the IANA timezone when needed.",
        components: {
          Field: "@/payload/components/city-timezone-input#CityTimezoneInput",
        },
      },
    },
    {
      name: "timezoneLabel",
      type: "text",
      required: true,
      admin: {
        description:
          "Automatically suggested from the timezone; you can edit it.",
        components: {
          Field: "@/payload/components/city-timezone-input#CityTimezoneInput",
        },
      },
    },
  ],
};
