"use client";

import { useRef, useTransition } from "react";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import EventDateNavigation from "@/components/contents/events/event-date-navigation";
import EventLayout from "@/components/contents/events/event-layout";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { useRouteParam } from "@/hooks/use-route-param";
import {
  formatDay,
  formatTime,
  groupEventsByDay,
  shiftDate,
} from "@/lib/events/event-list";
import {
  calendarDateParams,
  getWeekQuery,
  weekHeading,
} from "@/lib/events/event-week";
import type { PublicEvent } from "@/requests/events/get-events-by-city";

interface Props {
  cityName: string;
  timezone: string;
  today: string;
  query: ReturnType<typeof getWeekQuery>;
  events: PublicEvent[];
  error?: string;
  invalidFilters?: boolean;
}

export default function EventWeek({
  cityName,
  timezone,
  today,
  query,
  events,
  error,
  invalidFilters,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { clearAllParams } = useRouteParam();
  const [pending, startTransition] = useTransition();
  const grouped = new Map(
    groupEventsByDay(events, timezone, query.range).map((day) => [
      day.date,
      day.events,
    ]),
  );
  const days = Array.from({ length: 7 }, (_, index) =>
    shiftDate(query.range.from, index),
  );
  const heading = weekHeading(query.range.from, query.range.to);
  const dayHref = (date: string) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(
      calendarDateParams("list", date),
    )) {
      params.delete(key);
      if (value !== undefined) params.set(key, value);
    }
    return `${pathname}?${params}`;
  };
  const time = (event: PublicEvent) =>
    event.allDay ? "All day" : formatTime(event.startAt, timezone);

  return (
    <div ref={container} className="min-w-0 scroll-mt-header">
      <EventLayout view="week" date={query.range.from}>
        <EventDateNavigation
          view="week"
          date={query.range.from}
          today={today}
          scrollTarget={container}
        />
      </EventLayout>
      <SectionWrapper
        aria-label={`${cityName} weekly events`}
        className="sm:pt-0"
      >
        <header className="mb-8 space-y-2">
          <FadeUpText
            className="font-inter text-3xl uppercase sm:text-4xl"
            text={heading.title}
          />
          <p className="text-xs font-medium tracking-widest">{heading.year}</p>
        </header>
        {error ? (
          <div role="alert" className="space-y-3 py-8">
            <p className="text-sm">{error}</p>
            <Button
              variant="bordered"
              size="sm"
              disabled={pending}
              isLoading={pending}
              onPress={() =>
                invalidFilters
                  ? clearAllParams()
                  : startTransition(() => router.refresh())
              }
            >
              <HoverText
                text={invalidFilters ? "Clear filters" : "Try again"}
              />
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-4 w-fit bg-secondary px-2 py-0.5 text-xxs uppercase sm:text-xs">
              Select a day or event to open the day's full listing.
            </p>
            <div
              role="region"
              aria-label="Sunday to Saturday event calendar"
              tabIndex={0}
              className="w-full overflow-x-auto overscroll-x-contain pb-4 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <div className="grid max-w-full min-w-250 grid-cols-7 gap-3">
                {days.map((date) => (
                  <section
                    key={date}
                    aria-labelledby={`week-day-${date}`}
                    className="min-w-0"
                  >
                    <Link
                      href={dayHref(date)}
                      scroll={false}
                      aria-label={`View events on ${formatDay(date, "EEEE d MMMM yyyy")}`}
                      aria-current={date === today ? "date" : undefined}
                      className="block border-b border-light-gray pb-2 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <h3
                        id={`week-day-${date}`}
                        className="mb-2 text-xs font-medium uppercase"
                      >
                        <HoverText text={formatDay(date, "EEE")} />
                      </h3>
                      <time
                        dateTime={date}
                        className="text-2xl leading-8 font-medium"
                      >
                        {formatDay(date, "dd")}
                      </time>
                    </Link>
                    {(grouped.get(date) ?? []).map((event) => (
                      <Link
                        key={event.id}
                        href={dayHref(date)}
                        scroll={false}
                        className="block pt-6 pb-2 text-left transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <HoverText
                          text={event.title}
                          className="font-apris text-lg font-medium wrap-break-word text-primary uppercase sm:text-xl"
                        />
                        <p className="mt-2 text-xs uppercase">{time(event)}</p>
                        {(event.status === "cancelled" ||
                          event.status === "postponed") && (
                          <p className="mt-1 text-xs uppercase">
                            {event.status}
                          </p>
                        )}
                        <div className="mt-2 h-px bg-light-gray" />
                      </Link>
                    ))}
                    {!grouped.has(date) && (
                      <p className="py-6 text-xs uppercase">No events</p>
                    )}
                  </section>
                ))}
              </div>
            </div>
          </>
        )}
      </SectionWrapper>
    </div>
  );
}
