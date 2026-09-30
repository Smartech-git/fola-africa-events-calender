"use client";

import { ArrowUpRight, ChevronDown } from "lucide-react";

import HoverText from "@/components/animations/hover-text";
import Button, { type ButtonProps } from "@/components/ui/button";
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
import { eventSharePath, externalUrl } from "@/lib/events/event-list";
import type { PublicEvent } from "@/requests/events/get-events-by-city";

export function EventExternalAction({
  url,
  label,
  variant = "flat",
  size = "fit",
  className,
}: {
  url?: string | null;
  label: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const href = externalUrl(url);
  if (!href) return null;
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onPress={() => openExternal(href)}
      aria-label={`${label} (opens in a new tab)`}
      endContent={<ArrowUpRight size={16} aria-hidden="true" />}
    >
      <HoverText text={label} />
    </Button>
  );
}

const attendanceLabels: Record<string, string> = {
  tickets: "Buy tickets",
  rsvp: "RSVP",
  free: "More information",
};

export function EventAttendanceAction({
  event,
  prominent = false,
}: {
  event: PublicEvent;
  prominent?: boolean;
}) {
  const label = attendanceLabels[event.access];
  if (!label || event.status !== "published") return null;
  return (
    <EventExternalAction
      url={event.actionUrl}
      label={label}
      variant={prominent ? "solid" : "flat"}
      size={prominent ? "sm" : "fit"}
      className={prominent ? "min-w-48" : undefined}
    />
  );
}

export function EventCalendarActions({
  event,
  timezone,
}: {
  event: PublicEvent;
  timezone: string;
}) {
  const path = eventSharePath(event);
  return (
    <>
      <Dropdown>
        <DropdownTrigger asChild>
          <Button
            variant={"flat"}
            size={"fit"}
            aria-label={`Add ${event.title} to calendar`}
            endContent={<ChevronDown size={16} aria-hidden="true" />}
          >
            <HoverText text="Add to calendar" />
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
            endContent={<ArrowUpRight size={14} aria-hidden="true" />}
          >
            Google Calendar
          </DropdownItem_>
        </DropdownMenu>
      </Dropdown>
      <Button
        variant={"link"}
        size={"fit"}
        aria-label={`Share ${event.title}`}
        onPress={() => {
          void shareLink(event.title, path);
        }}
      >
        <HoverText text={"Share"} />
      </Button>
    </>
  );
}
