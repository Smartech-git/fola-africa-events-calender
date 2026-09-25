"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useLenis } from "lenis/react";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import EventDateNavigation from "@/components/contents/events/event-date-navigation";
import EventLayout from "@/components/contents/events/event-layout";
import EventListCard from "@/components/contents/events/event-list-card";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { useRouteParam } from "@/hooks/use-route-param";
import { shareLink } from "@/lib/events/event-actions";
import {
  dayPath,
  formatDay,
  getListQuery,
  groupEventsByDay,
} from "@/lib/events/event-list";
import { getEventList } from "@/requests/events/get-event-list";
import type { PublicEvent } from "@/requests/events/get-events-by-city";

interface Props {
  city: string;
  cityName: string;
  timezone: string;
  today: string;
  query: ReturnType<typeof getListQuery>;
  initialEvents: PublicEvent[];
  initialError?: string;
  invalidFilters?: boolean;
}

export default function EventList({
  city,
  cityName,
  timezone,
  today,
  query,
  initialEvents,
  initialError,
  invalidFilters,
}: Props) {
  const [events, setEvents] = useState(initialEvents);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(true);
  const container = useRef<HTMLDivElement>(null);
  const scrolledHash = useRef(false);
  const lenis = useLenis();
  const { clearAllParams } = useRouteParam();
  const days = useMemo(
    () => groupEventsByDay(events, timezone, query.range),
    [events, timezone, query.range],
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!lenis || scrolledHash.current || !globalThis.location.hash) return;
    const element = document.getElementById(globalThis.location.hash.slice(1));
    if (element && container.current?.contains(element)) {
      lenis.scrollTo(element, { offset: -210, immediate: true });
      scrolledHash.current = true;
    }
  }, [lenis, days]);

  const retry = async () => {
    if (busy.current || invalidFilters) return;
    busy.current = true;
    setLoading(true);
    try {
      const data = await getEventList(query.filters);
      if (!mounted.current) return;
      setEvents(data);
      setError(undefined);
    } catch {
      if (mounted.current)
        setError("We couldn't load events. Please try again.");
    } finally {
      busy.current = false;
      if (mounted.current) setLoading(false);
    }
  };

  return (
    <div ref={container}>
      <EventLayout
        view="list"
        date={query.range.from ?? query.range.to ?? today}
      >
        <EventDateNavigation
          view="list"
          date={query.range.from ?? query.range.to}
          today={today}
          scrollTarget={container}
        />
      </EventLayout>

      <SectionWrapper
        className="pt-0 sm:pt-0"
        aria-label={`${cityName} events`}
      >
        {days.map((day) => (
          <section key={day.date} aria-labelledby={`day-${day.date}`}>
            <header className="sticky top-header z-30 bg-primary-light pt-4 pb-2">
              <h2
                id={`day-${day.date}`}
                className="font-inter text-2xl font-light uppercase sm:text-4xl"
              >
                <time dateTime={day.date}>
                  <FadeUpText text={formatDay(day.date, "dd MMMM")} />
                </time>
              </h2>
              <div className="flex flex-wrap items-center justify-between gap-x-4">
                <p className="text-xs font-medium tracking-wide uppercase">
                  {formatDay(day.date, "EEEE \u00b7 yyyy")}
                </p>
                <Button
                  variant="flat"
                  size="fit"
                  className="text-xs focus-visible:outline-2 focus-visible:outline-primary"
                  aria-label={`Share events on ${formatDay(day.date, "d MMMM yyyy")}`}
                  onPress={() => {
                    void shareLink(
                      `${cityName} events \u00b7 ${formatDay(day.date, "d MMMM yyyy")}`,
                      dayPath(city, day.date),
                    );
                  }}
                >
                  <HoverText text="Share day" />
                </Button>
              </div>
            </header>
            {day.events.map((event) => (
              <EventListCard
                key={event.id}
                event={event}
                city={city}
                timezone={timezone}
                date={day.date}
              />
            ))}
          </section>
        ))}

        {!days.length && !error && (
          <div className="space-y-3 py-12" role="status">
            <h2 className="font-apris text-3xl uppercase">No events found</h2>
            <p className="text-sm">
              There are no published events matching these filters. Try another
              date or clear your filters.
            </p>
            <Button
              variant="link"
              size="fit"
              className=""
              onPress={clearAllParams}
            >
              Clear filters
            </Button>
          </div>
        )}
        {error && (
          <div role="alert" className="space-y-3 py-8">
            <p className="text-xs">{error}</p>
            <Button
              variant="bordered"
              size="sm"
              onPress={
                invalidFilters
                  ? clearAllParams
                  : () => {
                      void retry();
                    }
              }
              isLoading={loading}
              disabled={loading}
            >
              {invalidFilters ? "Clear filters" : "Try again"}
            </Button>
          </div>
        )}
        <p role="status" aria-live="polite" className="sr-only">
          {loading ? "Loading events" : `${events.length} events loaded`}
        </p>
      </SectionWrapper>
    </div>
  );
}
