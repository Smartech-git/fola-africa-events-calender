import type { TextField } from "payload";

import { formatSlug } from "@/payload/fields/format-slug";

export function slugField(sourceField: "title" | "name"): TextField {
  return {
    name: "slug",
    type: "text",
    required: true,
    unique: true,
    admin: {
      description: `Automatically filled from ${sourceField}. You can edit it manually.`,
      components: {
        Field: {
          path: "@/payload/components/slug-input#SlugInput",
          clientProps: { sourceField },
        },
      },
    },
    hooks: {
      beforeValidate: [({ value, siblingData, originalDoc }) => {
        if (typeof value === "string" && value.trim()) return value;
        if (originalDoc?.slug) return originalDoc.slug;
        const source = siblingData?.[sourceField] ?? originalDoc?.[sourceField];
        return typeof source === "string" ? formatSlug(source) : value;
      }],
    },
  };
}
