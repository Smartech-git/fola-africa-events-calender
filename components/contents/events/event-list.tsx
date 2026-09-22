"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useLenis } from "lenis/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import EventLayout from "@/components/contents/events/event-layout";
import EventListCard from "@/components/contents/events/event-list-card";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { EVENTS_LAYOUT_KEY, FILTER_KEYS } from "@/constants/filters";
import { useRouteParam } from "@/hooks/use-route-param";
import { shareLink } from "@/lib/events/event-actions";
import {
  dayPath,
  formatDay,
  getListQuery,
  groupEventsByDay,
  shiftDate,
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
  // Uses the LenisProvider already wrapping the frontend page.
  const lenis = useLenis();
  const { handleParamSet, clearAllParams } = useRouteParam();
  const days = useMemo(
    () => groupEventsByDay(events, timezone, query.range),
    [events, timezone, query.range],
  );
  const activeDate = query.range.from ?? today;

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

  const navigate = (date: string) => {
    handleParamSet({
      [EVENTS_LAYOUT_KEY]: "list",
      [FILTER_KEYS.date]: date,
      [FILTER_KEYS.dateFrom]: undefined,
      [FILTER_KEYS.dateTo]: undefined,
      [FILTER_KEYS.page]: undefined,
    });
    if (container.current)
      lenis?.scrollTo(container.current, { offset: -50, immediate: true });
  };

  return (
    <div ref={container}>
      <EventLayout>
        <div
          role="group"
          aria-label="Date navigation"
          className="flex flex-wrap gap-4"
        >
          <Button
            variant="flat"
            size="fit"
            className="min-h-11 text-xs"
            aria-label="Previous day"
            onPress={() => navigate(shiftDate(activeDate, -1))}
            startContent={<ChevronLeft size={16} aria-hidden="true" />}
          >
            Previous
          </Button>
          <Button
            variant="flat"
            size="fit"
            className="min-h-11 text-xs"
            onPress={() => navigate(today)}
          >
            Today
          </Button>
          <Button
            variant="flat"
            size="fit"
            className="min-h-11 text-xs"
            aria-label="Next day"
            onPress={() => navigate(shiftDate(activeDate, 1))}
            endContent={<ChevronRight size={16} aria-hidden="true" />}
          >
            Next
          </Button>
        </div>
      </EventLayout>

      <SectionWrapper
        className="pt-0 sm:pt-0"
        aria-label={`${cityName} events`}
      >
        {days.map((day) => (
          <section key={day.date} aria-labelledby={`day-${day.date}`}>
            <header className="sticky top-header z-30 bg-primary-light pt-8 pb-2">
              <h2
                id={`day-${day.date}`}
                className="font-inter text-4xl leading-tight font-light tracking-tight uppercase sm:text-[64px]"
              >
                <time dateTime={day.date}>
                  {formatDay(day.date, "dd MMMM")}
                </time>
              </h2>
              <div className="flex flex-wrap items-center justify-between gap-x-4">
                <p className="text-xs font-medium tracking-wide uppercase">
                  {formatDay(day.date, "EEEE \u00b7 yyyy")}
                </p>
                <Button
                  variant="flat"
                  size="fit"
                  className="min-h-11 text-xs focus-visible:outline-2 focus-visible:outline-primary"
                  aria-label={`Share events on ${formatDay(day.date, "d MMMM yyyy")}`}
                  onPress={() => {
                    void shareLink(
                      `${cityName} events \u00b7 ${formatDay(day.date, "d MMMM yyyy")}`,
                      dayPath(city, day.date),
                    );
                  }}
                >
                  Share day
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
              className="min-h-11"
              onPress={clearAllParams}
            >
              Clear filters
            </Button>
          </div>
        )}
        {error && (
          <div role="alert" className="space-y-3 py-8">
            <p className="text-sm">{error}</p>
            <Button
              variant="bordered"
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
