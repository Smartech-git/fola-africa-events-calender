import { APIError, type CollectionConfig } from "payload";

import { isAdmin, isStaff } from "../access";

export const seasons: CollectionConfig = {
  slug: "seasons",
  admin: {
    useAsTitle: "name",
    group: "Calendar",
    defaultColumns: ["name", "city", "startDate", "status", "isPublished"],
  },
  access: { create: isAdmin, update: isAdmin, delete: isAdmin, read: isStaff },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        const season = { ...originalDoc, ...data };
        if (
          season.startDate &&
          season.endDate &&
          Date.parse(season.endDate) < Date.parse(season.startDate)
        )
          throw new APIError(
            "Season end date cannot precede its start date.",
            400,
          );
        if (
          season.isPublished &&
          (!season.startDate || !season.endDate || season.isDemo)
        )
          throw new APIError(
            "Only non-demo seasons with confirmed date ranges can be published.",
            400,
          );
        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    {
      name: "city",
      type: "relationship",
      relationTo: "cities",
      required: true,
      index: true,
    },
    {
      name: "startDate",
      type: "date",
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    {
      name: "endDate",
      type: "date",
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    { name: "description", type: "text", maxLength: 240 },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "provisional",
      options: [
        { label: "Provisional", value: "provisional" },
        { label: "Final", value: "final" },
      ],
    },
    {
      name: "searchAliases",
      type: "array",
      admin: { description: "Internal aliases; never use as product labels." },
      fields: [{ name: "alias", type: "text", required: true }],
    },
    { name: "isPublished", type: "checkbox", defaultValue: false, index: true },
    { name: "isDemo", type: "checkbox", defaultValue: false },
    { name: "events", type: "join", collection: "events", on: "seasons" },
  ],
};
