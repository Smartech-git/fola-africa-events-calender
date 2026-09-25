"use client";

import { useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Dot } from "lucide-react";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import PixelBlast from "@/components/animations/pixel-blast";
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

const utilityClass = "text-xs";
const attendanceLabels: Record<string, string> = {
  tickets: "Buy tickets",
  rsvp: "RSVP",
  free: "More information",
};

export default function EventListCard({ event, city, timezone, date }: Props) {
  const cardRef = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
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
      ref={cardRef}
      id={anchor}
      aria-labelledby={`${anchor}-title`}
      className="group relative isolate cursor-pointer scroll-mt-56 border-b border-light-gray py-6"
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setIsHovered(true);
      }}
      onPointerLeave={() => setIsHovered(false)}
      onPointerCancel={() => setIsHovered(false)}
    >
      <FadeUpText
        as="h3"
        id={`${anchor}-title`}
        delay={0.3}
        className="relative z-10 font-apris text-xl font-medium wrap-break-word text-primary uppercase sm:text-3xl"
        text={event.title}
      />
      <div className="relative z-10 mt-1 space-y-1 text-sm leading-relaxed uppercase sm:text-[15px]">
        <p>
          <time dateTime={event.startAt}>{eventTime(event, timezone)}</time>
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
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <p>{access}</p>
          {actionUrl && (
            <Button
              variant="link"
              size="fit"
              className={utilityClass}
              aria-label={`${actionLabel} for ${event.title} (opens in a new tab)`}
              onPress={() => openExternal(actionUrl)}
              endContent={
                <ArrowUpRight
                  size={14}
                  className="transition-all group-hover:translate-x-1"
                  aria-hidden="true"
                />
              }
            >
              <HoverText text={actionLabel} />
            </Button>
          )}
        </div>
        {event.venue &&
          (mapUrl ? (
            <Button
              variant="flat"
              size="fit"
              className="max-w-full justify-start text-left text-xs whitespace-normal sm:text-xs"
              onPress={() => openExternal(mapUrl)}
              aria-label={`View ${event.venue.name} on a map (opens in a new tab)`}
              endContent={
                <ArrowUpRight
                  size={14}
                  className="shrink-0 transition-all group-hover:translate-x-1"
                  aria-hidden="true"
                />
              }
            >
              <HoverText text={event.venue.name} />
            </Button>
          ) : (
            <p>{event.venue.name}</p>
          ))}
        {event.status === "cancelled" && (
          <p className="font-medium">Cancelled</p>
        )}
        {event.status === "postponed" && (
          <p className="flex flex-wrap items-center font-medium">
            <span>Postponed</span>
            <Dot
              size={24}
              className="shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>New date to be confirmed</span>
          </p>
        )}
      </div>
      <div className="relative z-10 mt-4 flex flex-wrap gap-x-6 gap-y-1">
        <Dropdown>
          <DropdownTrigger asChild>
            <Button
              variant="link"
              size="fit"
              className={utilityClass}
              aria-label={`Add ${event.title} to calendar`}
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
          variant="link"
          size="fit"
          className={utilityClass}
          aria-label={`Share ${event.title}`}
          onPress={() => {
            void shareLink(event.title, path);
          }}
        >
          <HoverText text="Share" />
        </Button>
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            key="pixel-blast"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <PixelBlast
              interactionRef={cardRef}
              variant="square"
              pixelSize={6}
              color="#F5D3B7"
              patternScale={2}
              patternDensity={0.8}
              pixelSizeJitter={0}
              enableRipples
              rippleSpeed={0.4}
              rippleThickness={0.12}
              rippleIntensityScale={1.5}
              liquid={false}
              liquidStrength={0.12}
              liquidRadius={1.2}
              liquidWobbleSpeed={5}
              speed={0.5}
              edgeFade={0.15}
              transparent
            />
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
