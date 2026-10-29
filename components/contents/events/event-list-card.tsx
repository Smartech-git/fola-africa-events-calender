"use client";

import { useRef, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AnimatePresence, motion } from "framer-motion";

import HoverText from "@/components/animations/hover-text";
import PixelBlast from "@/components/animations/pixel-blast";
import { EventAttendanceAction } from "@/components/contents/events/event-actions";
import { eventAnchor, eventPath, formatTime } from "@/lib/events/event-list";
import { cn } from "@/lib/utils";
import { ACCESS_OPTIONS, EVENT_TYPES, INDUSTRIES } from "@/payload/constants";
import type { PublicEvent } from "@/requests/events/get-events-by-city";

interface Props {
  event: PublicEvent;
  city: string;
  timezone: string;
  date: string;
}

const info = "font-courier text-[15px] sm:text-lg";

export default function EventListCard({ event, city, timezone, date }: Props) {
  const router = useRouter();
  const cardRef = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const path = eventPath(event, city);
  const anchor = eventAnchor(event, date);

  const time = event.allDay
    ? "All day"
    : [event.startAt, event.endAt]
        .filter((instant): instant is string => Boolean(instant))
        .map((instant) => formatTime(instant, timezone))
        .join(" to ");
  const category = [
    EVENT_TYPES.find((item) => item.value === event.eventType)?.label,
    INDUSTRIES.find((item) => item.value === event.industry)?.label,
  ]
    .filter(Boolean)
    .join(" · ");
  const access =
    ACCESS_OPTIONS.find((item) => item.value === event.access)?.label ??
    event.access;
  const status =
    event.status === "cancelled"
      ? "Cancelled"
      : event.status === "postponed"
        ? "Postponed · New date to be confirmed"
        : null;

  return (
    <article
      ref={cardRef}
      id={anchor}
      aria-labelledby={anchor + "-title"}
      className="group relative isolate flex cursor-pointer scroll-mt-56 flex-col gap-1.5 border-b border-ink py-5 text-ink lg:flex-row lg:items-start lg:gap-5 lg:py-7 xl:gap-8"
      onClick={(e) => {
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        )
          return;
        const target = e.target as HTMLElement;
        if (
          !e.currentTarget.contains(target) ||
          target.closest(
            "a, button, [role='menuitem'], [data-event-actions]",
          ) ||
          window.getSelection()?.toString()
        )
          return;
        router.push(path);
      }}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setIsHovered(true);
      }}
      onPointerLeave={() => setIsHovered(false)}
      onPointerCancel={() => setIsHovered(false)}
    >
      <p
        className={cn(
          "relative z-10 font-courier text-sm tracking-cou text-red uppercase lg:w-1/6 lg:shrink-0 lg:text-base lg:text-ink xl:text-base",
        )}
      >
        <time dateTime={event.startAt}>{time}</time>
      </p>

      <div className="relative z-10 flex min-w-20 flex-1 flex-col gap-1.5 lg:gap-2">
        <Link
          href={path}
          className="w-fit focus-visible:outline-2 focus-visible:outline-red"
        >
          <HoverText
            trigger="article"
            className="font-montreal text-xl font-medium tracking-mono wrap-break-word uppercase sm:text-[26px]"
            text={event.title}
          />
        </Link>
        {category && <p className={info}>{category}</p>}
        {status && (
          <p className="font-courier text-sm tracking-cou text-red uppercase">
            {status}
          </p>
        )}
      </div>

      <p className={cn(info, "relative z-10 lg:w-1/6 lg:shrink-0")}>{access}</p>

      <p className="relative z-10 font-montreal text-base empty:hidden sm:text-lg lg:w-1/6 lg:shrink-0 lg:empty:block">
        {event.venue?.name}
      </p>

      <div
        data-event-actions
        className="relative z-10 pt-1.5 empty:hidden lg:flex lg:w-1/9 lg:shrink-0 lg:justify-end lg:pt-0 lg:empty:flex"
      >
        <EventAttendanceAction
          event={event}
          className="text-[15px] font-normal tracking-cou text-red"
        />
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
              variant="circle"
              pixelSize={12}
              color="#EAC5AE"
              patternScale={2}
              patternDensity={0.5}
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
