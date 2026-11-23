import type { CollectionConfig } from "payload";

import { isAdmin, noAccess } from "@/payload/access";
import { IMPORT_STATUSES } from "@/payload/imports/event-import-columns";

/** One record per CSV import of events, written by the importer on the Events list. */
export const eventImports: CollectionConfig = {
  slug: "event-imports",
  labels: { singular: "Event import", plural: "Event imports" },
  admin: {
    useAsTitle: "fileName",
    group: "Calendar",
    defaultColumns: [
      "fileName",
      "status",
      "created",
      "updated",
      "failed",
      "importedBy",
      "createdAt",
    ],
    description:
      "Every CSV import of events: who ran it, the file, and what happened to each row. Import from the Events list.",
  },
  access: {
    // Written only by the importer on the server.
    create: noAccess,
    read: isAdmin,
    update: noAccess,
    delete: isAdmin,
  },
  fields: [
    { name: "fileName", type: "text", admin: { readOnly: true } },
    {
      name: "status",
      label: "Imported as",
      type: "select",
      options: [...IMPORT_STATUSES],
      admin: { readOnly: true },
    },
    {
      name: "importedBy",
      type: "relationship",
      relationTo: "users",
      admin: { readOnly: true },
    },
    {
      type: "row",
      fields: [
        {
          name: "rows",
          label: "Rows in file",
          type: "number",
          admin: { readOnly: true },
        },
        { name: "created", type: "number", admin: { readOnly: true } },
        { name: "updated", type: "number", admin: { readOnly: true } },
        { name: "failed", type: "number", admin: { readOnly: true } },
      ],
    },
    {
      name: "events",
      label: "Events created or updated",
      type: "relationship",
      relationTo: "events",
      hasMany: true,
      admin: { readOnly: true },
    },
    {
      name: "failures",
      label: "Rows not imported",
      type: "json",
      admin: {
        readOnly: true,
        description: "The file's row number and why it wasn’t saved.",
      },
    },
  ],
};
