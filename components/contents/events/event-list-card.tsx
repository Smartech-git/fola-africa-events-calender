"use client";

import { ArrowUpRight } from "lucide-react";

import Button from "@/components/ui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem_,
} from "@/components/ui/drop-down";
import {
  downloadEventCalendar,
  openExternal,
  shareLink,
} from "@/lib/events/event-actions";
import { googleCalendarUrl } from "@/lib/events/event-calendar";
import {
  eventAnchor,
  eventPath,
  eventTime,
  externalUrl,
} from "@/lib/events/event-list";
import { ACCESS_OPTIONS, EVENT_TYPES, INDUSTRIES } from "@/payload/constants";
import type { PublicEvent } from "@/requests/events/get-events-by-city";

interface Props {
  event: PublicEvent;
  city: string;
  timezone: string;
  date: string;
}

const utilityClass =
  "min-h-11 text-xs underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary sm:text-sm";
const attendanceLabels: Record<string, string> = {
  tickets: "Buy tickets",
  rsvp: "RSVP",
  free: "More information",
};

export default function EventListCard({ event, city, timezone, date }: Props) {
  const path = eventPath(event, city, timezone);
  const industry = INDUSTRIES.find(
    (item) => item.value === event.industry,
  )?.label;
  const type = EVENT_TYPES.find(
    (item) => item.value === event.eventType,
  )?.label;
  const access =
    ACCESS_OPTIONS.find((item) => item.value === event.access)?.label ??
    event.access;
  const actionLabel = attendanceLabels[event.access];
  const actionUrl =
    actionLabel && event.status === "published"
      ? externalUrl(event.actionUrl)
      : undefined;
  const mapUrl = externalUrl(event.venue?.mapUrl);
  const anchor = eventAnchor(event, date);

  return (
    <article
      id={anchor}
      aria-labelledby={`${anchor}-title`}
      className="scroll-mt-56 border-b border-light-gray py-6"
    >
      <h3
        id={`${anchor}-title`}
        className="font-apris text-2xl leading-tight break-words uppercase sm:text-3xl"
      >
        {event.title}
      </h3>
      <div className="mt-1 space-y-1 text-sm leading-relaxed uppercase sm:text-[15px]">
        <p>
          <time dateTime={event.startAt}>{eventTime(event, timezone)}</time>
        </p>
        {event.eventType && (
          <p>
            {[type ?? event.eventType, industry]
              .filter(Boolean)
              .join(" \u00b7 ")}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <p>{access}</p>
          {actionUrl && (
            <Button
              variant="link"
              size="fit"
              className={utilityClass}
              aria-label={`${actionLabel} for ${event.title} (opens in a new tab)`}
              onPress={() => openExternal(actionUrl)}
              endContent={<ArrowUpRight size={16} aria-hidden="true" />}
            >
              {actionLabel}
            </Button>
          )}
        </div>
        {event.venue &&
          (mapUrl ? (
            <Button
              variant="flat"
              size="fit"
              className="min-h-11 max-w-full justify-start text-left text-sm whitespace-normal sm:text-[15px]"
              onPress={() => openExternal(mapUrl)}
              aria-label={`View ${event.venue.name} on a map (opens in a new tab)`}
              endContent={
                <ArrowUpRight
                  size={16}
                  className="shrink-0"
                  aria-hidden="true"
                />
              }
            >
              {event.venue.name}
            </Button>
          ) : (
            <p>{event.venue.name}</p>
          ))}
        {event.status === "cancelled" && (
          <p className="font-medium">Cancelled</p>
        )}
        {event.status === "postponed" && (
          <p className="font-medium">
            Postponed \u00b7 New date to be confirmed
          </p>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
        <Dropdown>
          <DropdownTrigger asChild>
            <Button
              variant="link"
              size="fit"
              className={utilityClass}
              aria-label={`Add ${event.title} to calendar`}
            >
              Add to calendar
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label={`Calendar options for ${event.title}`}
            onAction={(key) => {
              if (key === "ics") downloadEventCalendar(event, timezone, path);
              if (key === "google")
                openExternal(
                  googleCalendarUrl(
                    event,
                    timezone,
                    new URL(path, window.location.origin).href,
                  ),
                );
            }}
          >
            <DropdownItem_ key="ics">
              Download .ics (Apple / Outlook)
            </DropdownItem_>
            <DropdownItem_
              key="google"
              endContent={<ArrowUpRight size={16} aria-hidden="true" />}
            >
              Google Calendar
            </DropdownItem_>
          </DropdownMenu>
        </Dropdown>
        <Button
          variant="link"
          size="fit"
          className={utilityClass}
          aria-label={`Share ${event.title}`}
          onPress={() => {
            void shareLink(event.title, path);
          }}
        >
          Share
        </Button>
      </div>
    </article>
  );
}
