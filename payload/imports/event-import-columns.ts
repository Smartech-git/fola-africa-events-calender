import { toCsv } from "@/lib/csv";
import {
  ACCESS_OPTIONS,
  EVENT_TYPES,
  INDUSTRIES,
  VISIBILITY_OPTIONS,
} from "@/payload/constants";

export const EVENT_IMPORT_PATH = "/import";

/** Rows in one file; larger files are split before importing. */
export const MAX_IMPORT_ROWS = 500;
/** Rows saved per request, so each stays well inside the server time limit. */
export const IMPORT_CHUNK = 25;

export const IMPORT_STATUSES = [
  { label: "Published", value: "published" },
  { label: "Submitted (review queue)", value: "submitted" },
] as const;
export type ImportStatus = (typeof IMPORT_STATUSES)[number]["value"];

/** The template's columns, in order, with the example row. */
export const IMPORT_COLUMNS = [
  { name: "title", required: true, example: "Lagos Fintech Forum" },
  { name: "city", required: true, example: "Lagos" },
  { name: "start_date", required: true, example: "2027-02-18" },
  { name: "start_time", example: "10:00" },
  { name: "end_date", example: "2027-02-18" },
  { name: "end_time", example: "16:00" },
  { name: "all_day", example: "no" },
  { name: "industry", required: true, example: "Business and Finance" },
  { name: "event_type", required: true, example: "Forum" },
  { name: "access", required: true, example: "Registration required" },
  { name: "visibility", example: "Full listing" },
  { name: "action_url", example: "https://example.com/register" },
  { name: "website", example: "https://example.com" },
  { name: "instagram", example: "@example" },
  { name: "public_contact_email", example: "hello@example.com" },
  { name: "organiser", example: "Example Ventures" },
  { name: "venue", example: "Example Hall" },
  { name: "venue_area", example: "Victoria Island" },
  { name: "venue_address", example: "1 Example Road, Victoria Island" },
  {
    name: "description",
    example: "A day of talks on payments and lending across West Africa.",
  },
  { name: "source_url", example: "" },
] as const;

export type ImportColumn = (typeof IMPORT_COLUMNS)[number]["name"];
export type ImportValues = Partial<Record<ImportColumn, string>>;
export interface ImportRow {
  /** The line in the file, counting the header as 1. */
  row: number;
  values: ImportValues;
}

/** What each choice column accepts: the labels people see (or the stored values). */
export const IMPORT_CHOICES = [
  { column: "industry", options: INDUSTRIES },
  { column: "event_type", options: EVENT_TYPES },
  { column: "access", options: ACCESS_OPTIONS },
  { column: "visibility", options: VISIBILITY_OPTIONS },
] as const;

export const importTemplate = () =>
  toCsv([
    IMPORT_COLUMNS.map(({ name }) => name),
    IMPORT_COLUMNS.map(({ example }) => example),
  ]);

/** "Start Date " → "start_date", so headers match however they were typed. */
export const columnKey = (header: string) =>
  header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

/** The file's rows as named values, skipping empty lines. */
export function readImportRows(table: string[][]): {
  rows: ImportRow[];
  unknown: string[];
} {
  const [header = [], ...lines] = table;
  const keys = header.map(columnKey);
  const known = new Set<string>(IMPORT_COLUMNS.map(({ name }) => name));
  const rows = lines
    .map((cells, index) => ({
      row: index + 2,
      values: Object.fromEntries(
        keys
          .map((key, column) => [key, (cells[column] ?? "").trim()])
          .filter(([key]) => known.has(key)),
      ) as ImportValues,
    }))
    .filter(({ values }) => Object.values(values).some(Boolean));
  return {
    rows,
    unknown: keys.filter((key) => key && !known.has(key)),
  };
}

export interface RowCheck {
  row: number;
  title: string;
  city: string;
  ok: boolean;
  action?: "create" | "update";
  errors: string[];
  notes: string[];
}

export interface RowResult {
  row: number;
  ok: boolean;
  action?: "create" | "update";
  eventId?: number;
  error?: string;
}
