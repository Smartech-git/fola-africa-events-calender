import { relationID } from "@/payload/validation";

export const editorialFields = [
  "title",
  "city",
  "startAt",
  "endAt",
  "allDay",
  "industry",
  "secondaryIndustry",
  "eventType",
  "access",
  "visibility",
  "actionUrl",
  "organiser",
  "venue",
  "seasons",
  "description",
  "submittedOrganiser",
  "submittedVenue",
] as const;

export function eventSnapshot(
  event: Partial<Record<(typeof editorialFields)[number], unknown>>,
) {
  const submitted = event.submittedOrganiser;
  const staged =
    submitted &&
    typeof submitted === "object" &&
    "name" in submitted &&
    Boolean(submitted.name);
  return Object.fromEntries(
    editorialFields.map((key) => {
      let value = event[key] ?? null;
      if ((key === "organiser" || key === "venue") && staged) value = null;
      if (key === "submittedOrganiser" || key === "submittedVenue") {
        const fields =
          key === "submittedOrganiser"
            ? ["name", "type", "website", "contactEmail"]
            : ["name", "area", "address", "mapUrl"];
        const details = value as Record<string, unknown> | null;
        value = details?.name
          ? Object.fromEntries(
              fields.map((field) => [field, details[field] || null]),
            )
          : null;
      }
      if (["city", "organiser", "venue"].includes(key))
        value = relationID(value) ?? null;
      if (key === "seasons")
        value = Array.isArray(value) ? value.map(relationID).sort() : [];
      return [key, value];
    }),
  );
}

export function editorialChange(
  before: Record<string, any>,
  after: Record<string, any>,
) {
  if (
    JSON.stringify(eventSnapshot(before)) !==
    JSON.stringify(eventSnapshot(after))
  )
    return true;
  // Choosing records for a pending submission resolves identities; it does not
  // change the details the AI reviewed. Later relationship edits need reapproval.
  return (
    Boolean(before.approvedAt) &&
    ["organiser", "venue"].some(
      (key) => relationID(before[key]) !== relationID(after[key]),
    )
  );
}

export function matchesSnapshot(
  event: Partial<Record<(typeof editorialFields)[number], unknown>>,
  snapshot: unknown,
) {
  return (
    !!snapshot &&
    typeof snapshot === "object" &&
    !Array.isArray(snapshot) &&
    JSON.stringify(eventSnapshot(event)) ===
      JSON.stringify(eventSnapshot(snapshot as Record<string, unknown>))
  );
}
