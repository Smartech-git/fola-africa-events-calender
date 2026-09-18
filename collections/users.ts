import type { CollectionConfig } from "payload";

import { adminField, isAdmin, roleOf } from "../lib/calendar/access";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  access: {
    create: isAdmin,
    read: ({ req }) =>
      roleOf(req.user) === "admin"
        ? true
        : req.user
          ? { id: { equals: req.user.id } }
          : false,
    update: ({ req }) =>
      roleOf(req.user) === "admin"
        ? true
        : req.user
          ? { id: { equals: req.user.id } }
          : false,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === "create") {
          const { totalDocs } = await req.payload.count({
            collection: "users",
            req,
          });
          data.role = totalDocs === 0 ? "admin" : data.role || "reviewer";
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text" },
    {
      name: "role",
      type: "select",
      options: ["admin", "reviewer", "approver"],
      access: { create: adminField, update: adminField },
      admin: {
        description:
          "Legacy accounts without a role retain administrator access. New accounts default to reviewer.",
      },
    },
  ],
};
