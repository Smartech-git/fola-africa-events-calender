"use client";

import { useEffect, useMemo, useRef } from "react";

import { usePathname } from "next/navigation";

import { useLenis } from "lenis/react";
import { Share2 } from "lucide-react";

import FadeUpText from "@/components/animations/fade-up-text";
import EventDateNavigation from "@/components/contents/events/event-date-navigation";
import EventLayout from "@/components/contents/events/event-layout";
import EventListCard from "@/components/contents/events/event-list-card";
import NothingHereCard from "@/components/contents/events/nothing-here-card";
import NothingMatchesCard from "@/components/contents/events/nothing-matches-card";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import DateCircle from "@/components/ui/date-circle";
import { FILTER_KEYS } from "@/constants/filters";
import { useEventCalendar } from "@/hooks/use-event-calendar";
import { useRouteParam } from "@/hooks/use-route-param";
import { shareLink } from "@/lib/events/event-actions";
import {
  dayPath,
  formatDay,
  getListQuery,
  groupEventsByDay,
} from "@/lib/events/event-list";
import type { PublicEvent } from "@/requests/events/get-events-by-city";

const FILTERABLE_KEYS = [
  FILTER_KEYS.search,
  FILTER_KEYS.date,
  FILTER_KEYS.dateFrom,
  FILTER_KEYS.dateTo,
  FILTER_KEYS.industry,
  FILTER_KEYS.access,
];

interface Props {
  city: string;
  view: "list" | "day";
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
  view,
  cityName,
  timezone,
  today,
  query,
  initialEvents,
  initialError,
  invalidFilters,
}: Props) {
  const { events, error, loading, retry } = useEventCalendar({
    filters: query.filters,
    initialEvents,
    initialError,
    invalidFilters,
  });
  const pathname = usePathname();
  const container = useRef<HTMLDivElement>(null);
  const scrolledHash = useRef(false);
  const lenis = useLenis();
  const { clearAllParams, getFilterValue } = useRouteParam();
  const filtered = FILTERABLE_KEYS.some((key) => getFilterValue(key));
  const days = useMemo(
    () => groupEventsByDay(events, timezone, query.range),
    [events, timezone, query.range],
  );

  useEffect(() => {
    if (!lenis || scrolledHash.current || !globalThis.location.hash) return;
    const element = document.getElementById(globalThis.location.hash.slice(1));
    if (element && container.current?.contains(element)) {
      lenis.scrollTo(element, { offset: -210, immediate: true });
      scrolledHash.current = true;
    }
  }, [lenis, days]);

  return (
    <div ref={container}>
      <EventLayout
        view={view}
        date={query.range.from ?? query.range.to ?? today}
        today={today}
      >
        <EventDateNavigation
          view={view}
          date={query.range.from ?? query.range.to}
          today={today}
          scrollTarget={container}
        />
      </EventLayout>

      <SectionWrapper
        className="gap-4 pt-0 sm:gap-16 md:pt-0"
        aria-label={`${cityName} events`}
      >
        {days.map((day) => {
          const isToday = day.date === today;
          const count = `${day.events.length} ${day.events.length === 1 ? "happening" : "happenings"}`;
          return (
            <section key={day.date} aria-labelledby={`day-${day.date}`}>
              <header className="sticky top-sm-header bg-crea z-30 flex items-center gap-3 border-b border-ink bg-white pt-4 pb-3.5 sm:top-header sm:gap-5 sm:pb-4.5">
                <DateCircle size="sm" variant={isToday ? "filled" : "outline"}>
                  {formatDay(day.date, "dd")}
                </DateCircle>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <h2
                    id={`day-${day.date}`}
                    className="font-montreal text-xl font-medium tracking-mono md:text-3xl"
                  >
                    <time dateTime={day.date}>
                      <FadeUpText text={formatDay(day.date, "EEEE dd MMMM")} />
                    </time>
                  </h2>
                  <p className="font-courier text-xs tracking-cou text-red uppercase sm:shrink-0 sm:text-sm">
                    {isToday ? `Today \u00b7 ${count}` : count}
                  </p>
                </div>
                <Button
                  variant="flat"
                  size="fit"
                  className="shrink-0 text-red hover:text-ink"
                  aria-label={`Share events on ${formatDay(day.date, "d MMMM yyyy")}`}
                  onPress={() => {
                    void shareLink(
                      `${cityName} events \u00b7 ${formatDay(day.date, "d MMMM yyyy")}`,
                      dayPath(city, day.date, pathname),
                    );
                  }}
                >
                  <Share2 size={16} aria-hidden="true" />
                </Button>
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
          );
        })}

        {!days.length && !error && (
          <div className="py-12">
            {filtered ? (
              <NothingMatchesCard />
            ) : (
              <NothingHereCard label={cityName} />
            )}
          </div>
        )}
        {error && (
          <div role="alert" className="space-y-3 py-8">
            <p className="text-xs uppercase">{error}</p>
            <Button
              size="sm"
              onPress={
                invalidFilters
                  ? clearAllParams
                  : () => {
                      void retry();
                    }
              }
              className="min-w-18"
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
