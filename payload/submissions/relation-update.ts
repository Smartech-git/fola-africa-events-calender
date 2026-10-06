export type SubmissionRelation = "organiser" | "venue";

export const relationUpdateFields = {
  organiser: [
    { name: "name", label: "Name" },
    { name: "type", label: "Type" },
    { name: "website", label: "Website" },
    { name: "contactEmail", label: "Contact email" },
  ],
  venue: [
    { name: "name", label: "Name" },
    { name: "area", label: "Area" },
    { name: "address", label: "Address" },
    { name: "mapUrl", label: "Map URL" },
  ],
} as const;

export type RelationUpdatePlan = {
  recordId: string | number;
  fields: string[];
};

export function parseRelationUpdate(
  value: unknown,
  relation: SubmissionRelation,
): RelationUpdatePlan | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const { recordId, fields } = value as RelationUpdatePlan;
  if (
    !(
      (typeof recordId === "number" &&
        Number.isSafeInteger(recordId) &&
        recordId > 0) ||
      (typeof recordId === "string" && recordId.trim().length > 0)
    ) ||
    !Array.isArray(fields) ||
    !fields.length ||
    new Set(fields).size !== fields.length ||
    !fields.every((key) =>
      relationUpdateFields[relation].some((field) => field.name === key),
    )
  )
    return null;
  return { recordId, fields };
}
