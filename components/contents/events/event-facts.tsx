import { Dot } from "lucide-react";

import { eventTime } from "@/lib/events/event-list";
import { ACCESS_OPTIONS, EVENT_TYPES, INDUSTRIES } from "@/payload/constants";
import type { PublicEvent } from "@/requests/events/get-events-by-city";

export default function EventFacts({
  event,
  timezone,
  showTimezone = false,
}: {
  event: PublicEvent;
  timezone: string;
  showTimezone?: boolean;
}) {
  const industry = INDUSTRIES.find(
    (item) => item.value === event.industry,
  )?.label;
  const type = EVENT_TYPES.find(
    (item) => item.value === event.eventType,
  )?.label;
  const access =
    ACCESS_OPTIONS.find((item) => item.value === event.access)?.label ??
    event.access;
  const zone = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    timeZoneName: "short",
  })
    .formatToParts(new Date(event.startAt))
    .find((part) => part.type === "timeZoneName")?.value;
  return (
    <>
      <p>
        <time dateTime={event.startAt}>{eventTime(event, timezone)}</time>
        {showTimezone &&
          !event.allDay &&
          ` · ${event.city?.timezoneLabel || zone}`}
      </p>
      {event.eventType && (
        <p className="flex flex-wrap items-center">
          <span>{type ?? event.eventType}</span>
          {industry && (
            <>
              <Dot
                size={24}
                className="shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>{industry}</span>
            </>
          )}
        </p>
      )}
      <p>{access}</p>
      {event.status === "cancelled" && <p className="font-medium">Cancelled</p>}
      {event.status === "postponed" && (
        <p className="font-medium">Postponed · New date to be confirmed</p>
      )}
    </>
  );
}
