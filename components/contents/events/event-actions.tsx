"use client";

import { useSyncExternalStore } from "react";

import Link from "next/link";

import { ArrowUpRight, CalendarPlus, ChevronDown, Share2 } from "lucide-react";

import HoverText from "@/components/animations/hover-text";
import Button, { button, type ButtonProps } from "@/components/ui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem_,
} from "@/components/ui/drop-down";
import {
  copyLink,
  downloadEventCalendar,
  openExternal,
  shareLink,
} from "@/lib/events/event-actions";
import { googleCalendarUrl } from "@/lib/events/event-calendar";
import { eventSharePath, externalUrl } from "@/lib/events/event-list";
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
  const action = actionURL(url);
  const email = action?.startsWith("mailto:") ?? false;
  const href = email ? action : externalUrl(action);
  if (!href) return null;
  return (
    <Link
      href={href}
      {...(email ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      className={cn(button({ variant, size }), className)}
      aria-label={`${label} (${email ? "opens your email app" : "opens in a new tab"})`}
    >
      <HoverText text={label} />
      <ArrowUpRight size={16} aria-hidden="true" />
    </Link>
  );
}

const attendanceLabels: Record<string, string> = {
  tickets: "Buy tickets",
  registration: "Register",
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

export function EventDetailActions({
  event,
  timezone,
}: {
  event: PublicEvent;
  timezone: string;
}) {
  const path = eventSharePath(event);
  const canShare = useCanShare();
  const icon = { size: 18, "aria-hidden": true } as const;
  return (
    <div className="grid flex-wrap gap-3 sm:grid-cols-2 md:flex">
      <EventAttendanceAction
        event={event}
        prominent
        className="max-md:w-full sm:col-span-2"
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
      <Dropdown>
        <DropdownTrigger asChild>
          <Button
            size="sm"
            variant="bordered"
            aria-label={`Share ${event.title}`}
            startContent={<Share2 {...icon} />}
            endContent={<ChevronDown size={14} aria-hidden="true" />}
            className="max-md:w-full"
          >
            <HoverText text="Share" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label={`Share options for ${event.title}`}
          onAction={(key) => {
            if (key === "copy") void copyLink(path);
            if (key === "share") void shareLink(event.title, path);
          }}
        >
          {(canShare ? SHARE_OPTIONS : SHARE_OPTIONS.slice(0, 1)).map(
            ({ key, label }) => (
              <DropdownItem_ key={key}>{label}</DropdownItem_>
            ),
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}

const SHARE_OPTIONS = [
  { key: "copy", label: "Copy link" },
  { key: "share", label: "Share event via…" },
];

const noSubscription = () => () => {};

// Only offer the device share sheet where the browser has one. False on the
// server so the first render matches before the client checks.
function useCanShare() {
  return useSyncExternalStore(
    noSubscription,
    () => typeof navigator.share === "function",
    () => false,
  );
}
