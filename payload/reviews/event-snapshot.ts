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
] as const;

export function eventSnapshot(
  event: Partial<Record<(typeof editorialFields)[number], unknown>>,
) {
  return Object.fromEntries(
    editorialFields.map((key) => {
      let value = event[key] ?? null;
      if (["city", "organiser", "venue"].includes(key))
        value = relationID(value) ?? null;
      if (key === "seasons")
        value = Array.isArray(value) ? value.map(relationID).sort() : [];
      return [key, value];
    }),
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
