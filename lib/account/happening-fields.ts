import {
  ACCESS_OPTIONS,
  EVENT_TYPES,
  INDUSTRIES,
  VISIBILITY_OPTIONS,
} from "@/payload/constants";
import {
  EDITABLE_FIELDS,
  type EditHappeningValues,
} from "@/validations/happening-edit";

// Shared by the edit page (browser) and the change emails (server).

export type HappeningValues = Omit<
  EditHappeningValues,
  "artworkRights" | "note"
>;
export type HappeningField = (typeof EDITABLE_FIELDS)[number]["name"];

/** The fields whose values differ. */
export function changedFields(before: HappeningValues, after: HappeningValues) {
  return EDITABLE_FIELDS.map(({ name }) => name).filter(
    (name) => String(before[name] ?? "") !== String(after[name] ?? ""),
  );
}

export const fieldLabel = (name: string) =>
  EDITABLE_FIELDS.find((field) => field.name === name)?.label ?? name;

const optionLabel = (
  options: { label: string; value: string }[],
  value: unknown,
) =>
  options.find((option) => option.value === value)?.label ??
  String(value ?? "");

/** A value as people read it, for emails and the change list. */
export function displayValue(name: HappeningField, value: unknown) {
  if (value === "" || value === null || value === undefined) return "";
  switch (name) {
    case "startAt":
    case "endAt": {
      // Wall times in the event's city, so format them without a zone shift.
      const date = new Date(`${value}:00Z`);
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: "UTC",
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(date);
    }
    case "allDay":
      return value ? "Yes" : "No";
    case "industry":
      return optionLabel(INDUSTRIES, value);
    case "eventType":
      return optionLabel(EVENT_TYPES, value);
    case "access":
      return optionLabel(ACCESS_OPTIONS, value);
    case "visibility":
      return optionLabel(VISIBILITY_OPTIONS, value);
    case "artwork":
      return "New image";
    default:
      return String(value);
  }
}
