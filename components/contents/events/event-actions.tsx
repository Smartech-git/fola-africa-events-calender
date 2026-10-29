"use client";

import { ArrowUpRight, CalendarPlus, ChevronDown, Share2 } from "lucide-react";

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
import { eventSharePath } from "@/lib/events/event-list";
import { cn } from "@/lib/utils";
import { actionURL } from "@/payload/validation";
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
  // Action links may be web addresses or emails saved as mailto: links.
  const href = actionURL(url);
  if (!href) return null;
  const email = href.startsWith("mailto:");
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onPress={() =>
        email ? window.location.assign(href) : openExternal(href)
      }
      aria-label={`${label} (${email ? "opens your email app" : "opens in a new tab"})`}
      endContent={<ArrowUpRight size={16} aria-hidden="true" />}
    >
      <HoverText text={label} />
    </Button>
  );
}

const attendanceLabels: Record<string, string> = {
  tickets: "Buy tickets",
  rsvp: "RSVP",
  free: "Register",
  "industry-only": "Register",
};

export function EventAttendanceAction({
  event,
  prominent = false,
  className,
}: {
  event: PublicEvent;
  prominent?: boolean;
  className?: string;
}) {
  const label = attendanceLabels[event.access];
  if (!label || event.status !== "published") return null;
  return (
    <EventExternalAction
      url={event.actionUrl}
      label={label}
      variant={prominent ? "solid" : "flat"}
      size={prominent ? "sm" : "fit"}
      className={cn(prominent && "min-w-48", className)}
    />
  );
}

// Figma: Event Page — Desktop (333:2366), the action row under the facts.
export function EventDetailActions({
  event,
  timezone,
}: {
  event: PublicEvent;
  timezone: string;
}) {
  const path = eventSharePath(event);
  const icon = { size: 18, "aria-hidden": true } as const;
  return (
    <div className="grid grid-cols-2 flex-wrap gap-3 md:flex">
      <EventAttendanceAction
        event={event}
        prominent
        className="col-span-2 max-md:w-full"
      />
      <Dropdown>
        <DropdownTrigger asChild>
          <Button
            size="sm"
            variant="bordered"
            aria-label={`Add ${event.title} to calendar`}
            startContent={<CalendarPlus {...icon} />}
            endContent={<ChevronDown size={14} aria-hidden="true" />}
            className="max-md:w-full"
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
        variant="bordered"
        aria-label={`Share ${event.title}`}
        startContent={<Share2 {...icon} />}
        className="max-md:w-full"
        size="sm"
        onPress={() => {
          void shareLink(event.title, path);
        }}
      >
        <HoverText text="Share" />
      </Button>
    </div>
  );
}
