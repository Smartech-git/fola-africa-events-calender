import type { PayloadHandler, PayloadRequest } from "payload";

import { roleOf } from "@/payload/access";
import {
  BREVO_ATTRIBUTES,
  brevoAttributes,
  brevoAudience,
} from "@/payload/members/brevo";

export const BREVO_EXPORT_PATH = "/brevo-export";

// The same attributes the automatic sync sends (payload/members/brevo.ts).
const COLUMNS = ["EMAIL", ...BREVO_ATTRIBUTES.map(({ name }) => name)];

/** CSV-quoted, and never read as a formula if the file is opened in a spreadsheet. */
function cell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

async function brevoCsv(req: PayloadRequest) {
  const members = await req.payload.find({
    collection: "members",
    where: brevoAudience,
    pagination: false,
    sort: "createdAt",
    depth: 1,
    joins: false,
    req,
    populate: { cities: { name: true } },
  });
  const rows = members.docs.map((member) => {
    const attributes = brevoAttributes(member);
    return [
      member.email,
      ...BREVO_ATTRIBUTES.map(({ name }) => attributes[name]),
    ].map(cell);
  });
  return [COLUMNS.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
}

/**
 * GET /api/members/brevo-export: a CSV of members who agreed to marketing,
 * ready for Brevo's Contacts → Import contacts. Administrators only.
 */
export const brevoExportHandler: PayloadHandler = async (req) => {
  if (roleOf(req.user) !== "admin")
    return Response.json(
      { errors: [{ message: "Only administrators can export members." }] },
      { status: 403 },
    );
  const date = new Date().toISOString().slice(0, 10);
  return new Response(await brevoCsv(req), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="happenings-members-brevo-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
};
