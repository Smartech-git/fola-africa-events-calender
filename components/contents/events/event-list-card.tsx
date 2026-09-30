"use client";

import { useRef, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AnimatePresence, motion } from "framer-motion";

import FadeUpText from "@/components/animations/fade-up-text";
import PixelBlast from "@/components/animations/pixel-blast";
import {
  EventAttendanceAction,
  EventCalendarActions,
  EventExternalAction,
} from "@/components/contents/events/event-actions";
import EventFacts from "@/components/contents/events/event-facts";
import { eventAnchor, eventPath, externalUrl } from "@/lib/events/event-list";
import type { PublicEvent } from "@/requests/events/get-events-by-city";

interface Props {
  event: PublicEvent;
  city: string;
  timezone: string;
  date: string;
}

export default function EventListCard({ event, city, timezone, date }: Props) {
  const router = useRouter();
  const cardRef = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const path = eventPath(event, city);
  const mapUrl = externalUrl(event.venue?.mapUrl);
  const anchor = eventAnchor(event, date);

  return (
    <article
      ref={cardRef}
      id={anchor}
      aria-labelledby={anchor + "-title"}
      className="group relative isolate cursor-pointer scroll-mt-56 border-b border-light-gray py-6"
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
      <Link
        href={path}
        className="relative z-10 block w-fit focus-visible:outline-2 focus-visible:outline-primary"
      >
        <FadeUpText
          as="h3"
          id={anchor + "-title"}
          delay={0.3}
          className="font-apris text-2xl font-medium wrap-break-word text-primary uppercase sm:text-3xl"
          text={event.title}
        />
      </Link>
      <div className="relative z-10 mt-1 space-y-1 text-xs leading-relaxed uppercase sm:text-sm">
        <EventFacts event={event} timezone={timezone} />
        <div
          data-event-actions
          className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-1"
        >
          {event.venue &&
            (mapUrl ? (
              <EventExternalAction
                url={mapUrl}
                label={event.venue.name}
                className="max-w-full justify-start text-left text-xs whitespace-normal sm:text-xs"
              />
            ) : (
              <p>{event.venue.name}</p>
            ))}
          <EventAttendanceAction event={event} />
        </div>
      </div>
      <div
        data-event-actions
        className="relative z-10 mt-4 flex flex-wrap gap-x-6 gap-y-1"
      >
        <EventCalendarActions event={event} timezone={timezone} />
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
