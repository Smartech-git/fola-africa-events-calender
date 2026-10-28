"use client";

import { useRef } from "react";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import EventDateNavigation from "@/components/contents/events/event-date-navigation";
import EventDots from "@/components/contents/events/event-dots";
import EventLayout from "@/components/contents/events/event-layout";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { useEventCalendar } from "@/hooks/use-event-calendar";
import { useRouteParam } from "@/hooks/use-route-param";
import { cityDate, formatDay, groupEventsByDay } from "@/lib/events/event-list";
import { getMonthQuery, monthWeeks } from "@/lib/events/event-month";
import { calendarDateParams } from "@/lib/events/event-week";
import { getSeasonDays } from "@/lib/events/season-calendar";
import { cn } from "@/lib/utils";
import type { PublicEvent } from "@/requests/events/get-events-by-city";
import type { SeasonSummary } from "@/requests/events/get-events-header";

interface Props {
  cityName: string;
  timezone: string;
  today: string;
  query: ReturnType<typeof getMonthQuery>;
  events: PublicEvent[];
  seasons: SeasonSummary[];
  error?: string;
  invalidFilters?: boolean;
}

export default function EventMonth({
  cityName,
  timezone,
  today,
  query,
  events: initialEvents,
  seasons,
  error: initialError,
  invalidFilters,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { clearAllParams } = useRouteParam();
  const {
    events,
    error,
    loading: pending,
    retry,
  } = useEventCalendar({
    filters: query.filters,
    initialEvents,
    initialError,
    invalidFilters,
  });
  const weeks = monthWeeks(query.range.from);
  const byDay = new Map(
    groupEventsByDay(events, timezone, query.range).map((day) => [
      day.date,
      day.events,
    ]),
  );
  const seasonDays = getSeasonDays(seasons, timezone, query.range);
  const seasonStarts = new Set(
    seasons.flatMap((season) =>
      season.startDate ? [cityDate(season.startDate, timezone)] : [],
    ),
  );
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

  return (
    <div ref={container} className="min-w-0 scroll-mt-header">
      <EventLayout view="month" date={query.range.from}>
        <EventDateNavigation
          view="month"
          date={query.range.from}
          today={today}
          scrollTarget={container}
        />
      </EventLayout>
      <SectionWrapper
        aria-label={`${cityName} monthly events`}
        className="min-w-0 pt-4 sm:pt-4"
      >
        <header className="mb-4 space-y-2 sm:mb-8">
          <h2>
            <FadeUpText
              className="font-courier text-3xl uppercase sm:text-4xl"
              text={formatDay(query.range.from, "MMMM yyyy")}
            />
          </h2>
        </header>
        {error ? (
          <div role="alert" className="space-y-3 py-8">
            <p className="text-sm">{error}</p>
            <Button
              size="sm"
              className="mt-8"
              disabled={pending}
              isLoading={pending}
              onPress={() => (invalidFilters ? clearAllParams() : void retry())}
            >
              <HoverText
                text={invalidFilters ? "Clear filters" : "Try again"}
              />
            </Button>
          </div>
        ) : (
          <>
            <div
              role="region"
              aria-label="Monthly event calendar"
              tabIndex={0}
              className="w-full min-w-0 overflow-x-auto overscroll-x-contain pb-4 focus-visible:outline-2 focus-visible:outline-red"
            >
              {/* Figma: Month grid (332:2304). */}
              <table className="w-full min-w-200 table-fixed border-collapse text-left">
                <caption className="sr-only">
                  {cityName} events for{" "}
                  {formatDay(query.range.from, "MMMM yyyy")}
                </caption>
                <thead>
                  <tr>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <th
                          scope="col"
                          key={day}
                          className="pb-2.5 font-courier text-sm font-normal tracking-cou text-red uppercase"
                        >
                          {day}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week) => (
                    <tr key={week[0]}>
                      {week.map((date) => {
                        if (date < query.range.from || date > query.range.to)
                          return (
                            <td
                              key={date}
                              className="border-t border-ink/12 p-0"
                            />
                          );
                        const dayEvents = byDay.get(date) ?? [];
                        const daySeasons = seasonDays.get(date) ?? [];
                        const count = dayEvents.length;
                        // The circle marks today and the day a season opens.
                        const marked = date === today || seasonStarts.has(date);
                        return (
                          <td
                            key={date}
                            className="border-t border-ink/85 p-0 align-top"
                          >
                            <Link
                              href={dayHref(date)}
                              scroll={false}
                              aria-current={date === today ? "date" : undefined}
                              aria-label={[
                                formatDay(date, "EEEE d MMMM yyyy"),
                                `${count} ${count === 1 ? "event" : "events"}`,
                                ...daySeasons.map((season) => season.name),
                              ].join(", ")}
                              className="group/day flex min-h-30 flex-col items-start gap-2.5 pt-3 pb-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-red sm:min-h-37.5"
                            >
                              <time
                                dateTime={date}
                                className={cn(
                                  "flex size-12 items-center justify-center rounded-full border-[1.5px] font-courier text-lg tracking-cou transition-colors group-hover/day:border-red group-hover/day:bg-red group-hover/day:text-white group-focus-visible/day:border-red group-focus-visible/day:bg-red group-focus-visible/day:text-white sm:size-16 sm:text-[22px]",
                                  marked
                                    ? "border-red text-red"
                                    : "border-transparent",
                                )}
                              >
                                {formatDay(date, "d")}
                              </time>
                              {daySeasons.length > 0 && (
                                <span className="flex flex-col gap-0.5 font-courier text-xs tracking-cou text-red uppercase">
                                  {daySeasons.map((season) => (
                                    <span key={season.id}>{season.name}</span>
                                  ))}
                                </span>
                              )}
                              <EventDots events={dayEvents} />
                            </Link>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <MonthKey />
          </>
        )}
      </SectionWrapper>
    </div>
  );
}

const ring = "size-5.5 rounded-full border-[1.5px] border-red";
const dot = "size-2 rounded-full";

// Figma: Month grid key (332:2470).
const KEY = [
  { label: "Today", mark: <span className={ring} /> },
  {
    label: "Selected",
    mark: <span className="size-5.5 rounded-full bg-red" />,
  },
  { label: "Public", mark: <span className={cn(dot, "bg-red")} /> },
  { label: "Private", mark: <span className={cn(dot, "border border-red")} /> },
  {
    label: "Busy",
    mark: (
      <span className="flex gap-1">
        {[0, 1, 2].map((index) => (
          <span key={index} className={cn(dot, "bg-red")} />
        ))}
      </span>
    ),
  },
  { label: "Significant · Labelled", mark: <span className={ring} /> },
];

function MonthKey() {
  return (
    <ul
      aria-label="Calendar key"
      className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 sm:mt-10"
    >
      {KEY.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-2.5 font-courier text-sm tracking-cou uppercase"
        >
          <span aria-hidden="true">{item.mark}</span>
          {item.label}
        </li>
      ))}
    </ul>
  );
}
