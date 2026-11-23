import type { Payload, TypedUser } from "payload";

import { roleOf } from "@/payload/access";
import { EventsCsvImportPanel } from "@/payload/components/events-csv-import-panel";
import { EVENT_IMPORT_PATH } from "@/payload/imports/event-import-columns";

/** Above the Events list: import events from a CSV. Administrators only, like the import itself. */
export function EventsCsvImport({
  payload,
  user,
}: {
  payload: Payload;
  user?: TypedUser | null;
}) {
  if (!user || roleOf(user) !== "admin") return null;
  const api = payload.config.routes.api;
  return (
    <EventsCsvImportPanel
      endpoint={`${api}/events${EVENT_IMPORT_PATH}`}
      logPath={`${payload.config.routes.admin}/collections/event-imports`}
    />
  );
}
