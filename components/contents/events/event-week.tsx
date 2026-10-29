"use client";

import { useRef } from "react";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { ArrowRight } from "lucide-react";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import EventDateNavigation from "@/components/contents/events/event-date-navigation";
import EventLayout from "@/components/contents/events/event-layout";
import NothingHereCard from "@/components/contents/events/nothing-here-card";
import NothingMatchesCard from "@/components/contents/events/nothing-matches-card";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import DateCircle from "@/components/ui/date-circle";
import { useEventCalendar } from "@/hooks/use-event-calendar";
import { useRouteParam } from "@/hooks/use-route-param";
import { activeFilterLabels } from "@/lib/events/active-filters";
import {
  accessLabel,
  categoryLabel,
  isPrivateEvent,
} from "@/lib/events/event-details";
import {
  cityDate,
  eventPath,
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
import { formatSeasonDates } from "@/lib/events/season-dates";
import { cn } from "@/lib/utils";
import type { PublicEvent } from "@/requests/events/get-events-by-city";
import type { SeasonSummary } from "@/requests/helpers/types";

/** Events shown per day before the rest fold into "+ N more". */
const MAX_EVENTS = 4;

const happenings = (count: number) =>
  `${count} ${count === 1 ? "happening" : "happenings"}`;

interface Props {
  city: string;
  cityName: string;
  timezone: string;
  today: string;
  query: ReturnType<typeof getWeekQuery>;
  events: PublicEvent[];
  seasons: SeasonSummary[];
  error?: string;
  invalidFilters?: boolean;
}

// Figma: City Calendar · Week (487:2348).
export default function EventWeek({
  city,
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
  const bands = weekSeasons(seasons, timezone, days);
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
      <EventLayout view="week" date={query.range.from} today={today}>
        <EventDateNavigation
          view="week"
          date={query.range.from}
          today={today}
          scrollTarget={container}
        />
      </EventLayout>
      <SectionWrapper
        aria-label={`${cityName} weekly events`}
        className="pt-0 md:pt-0"
      >
        <header className="mb-4 sm:mb-8">
          <FadeUpText
            className="font-montreal text-xl font-medium tracking-mono md:text-3xl"
            text={heading.title}
          />
        </header>
        {error ? (
          <div role="alert" className="space-y-3 py-8">
            <p className="text-xs uppercase">{error}</p>
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
              aria-label="Sunday to Saturday event calendar"
              tabIndex={0}
              className="w-full overflow-x-auto scrollbar-thin  pb-4 focus-visible:outline-2 focus-visible:outline-red"
            >
              <div className="flex min-w-250 flex-col gap-4">
                {bands.length > 0 && (
                  <div className="grid grid-cols-7 gap-y-1">
                    {bands.map((band) => (
                      <SeasonRow
                        key={band.season.id}
                        {...band}
                        timezone={timezone}
                      />
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-7 min-w-300 border-t-[1.5px] border-ink">
                  {days.map((date, index) => {
                    const dayEvents = grouped.get(date) ?? [];
                    const isToday = date === today;
                    const hidden = dayEvents.length - MAX_EVENTS;
                    return (
                      <section
                        key={date}
                        aria-labelledby={`week-day-${date}`}
                        className={cn(
                          "flex flex-col px-3 pt-4 pb-6",
                          index > 0 && "border-l border-ink/15",
                          isToday && "bg-cream",
                        )}
                      >
                        <Link
                          href={dayHref(date)}
                          scroll={false}
                          aria-label={`${formatDay(date, "EEEE d MMMM yyyy")}${isToday ? ", today" : ""}: ${happenings(dayEvents.length)}`}
                          aria-current={isToday ? "date" : undefined}
                          className="group/day flex items-center gap-2.5 pb-3.5 focus-visible:outline-2 focus-visible:outline-red"
                        >
                          <DateCircle
                            className={cn(
                              "size-12 text-[22px] transition-colors",
                              isToday
                                ? "group-hover/day:bg-red group-hover/day:text-white"
                                : "border-transparent text-ink group-hover/day:border-red group-hover/day:text-red",
                            )}
                          >
                            <time dateTime={date}>{formatDay(date, "d")}</time>
                          </DateCircle>
                          <span className="flex min-w-0 flex-col gap-0.5 font-courier tracking-cou uppercase">
                            <span
                              id={`week-day-${date}`}
                              className={cn(
                                "text-xs",
                                isToday ? "text-red" : "text-ink",
                              )}
                            >
                              {formatDay(date, "EEE")}
                              {isToday && " · Today"}
                            </span>
                            <span className="text-xxs text-ink/60">
                              {happenings(dayEvents.length)}
                            </span>
                          </span>
                        </Link>

                        {dayEvents.slice(0, MAX_EVENTS).map((event) => (
                          <WeekEvent
                            key={event.id}
                            event={event}
                            city={city}
                            timezone={timezone}
                          />
                        ))}

                        {hidden > 0 && (
                          <Link
                            href={dayHref(date)}
                            scroll={false}
                            className="flex items-center gap-1.5 border-t border-ink/20 pt-3 font-courier text-xs tracking-cou text-red uppercase transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-red"
                          >
                            + {hidden} more
                            <ArrowRight size={14} aria-hidden="true" />
                          </Link>
                        )}
                      </section>
                    );
                  })}
                </div>
              </div>
            </div>

            <WeekKey />

            {!events.length && !pending && (
              <div className="pt-8">
                {activeFilterLabels(searchParams, { includeDates: false })
                  .length ? (
                  <NothingMatchesCard includeDates={false} />
                ) : (
                  <NothingHereCard label={`${cityName} · ${heading.title}`} />
                )}
              </div>
            )}
          </>
        )}
      </SectionWrapper>
    </div>
  );
}

function WeekEvent({
  event,
  city,
  timezone,
}: {
  event: PublicEvent;
  city: string;
  timezone: string;
}) {
  const status =
    event.status === "cancelled"
      ? "Cancelled"
      : event.status === "postponed"
        ? "Postponed"
        : null;

  return (
    <Link
      href={eventPath(event, city)}
      className="group/event flex flex-col gap-1 border-t border-ink/20 py-3 focus-visible:outline-2 focus-visible:outline-red"
    >
      <span className="flex items-center gap-1.5 font-courier text-xs tracking-cou text-red uppercase">
        <span
          aria-hidden="true"
          className={cn(
            "size-1.75 shrink-0 mb-0.5 rounded-full",
            isPrivateEvent(event) ? "border border-red" : "bg-red",
          )}
        />
        {event.allDay ? "All day" : formatTime(event.startAt, timezone)}
      </span>
      <HoverText
        text={event.title}
        trigger="a"
        className="font-montreal text-[15px] font-medium tracking-mono wrap-break-word uppercase"
      />
      <span className="font-courier text-[11px] text-ink/75">
        {categoryLabel(event)}
      </span>
      <span className="font-courier text-[11px] text-ink">
        {accessLabel(event)}
      </span>
      {status && (
        <span className="font-courier text-[11px] tracking-cou text-red uppercase">
          {status}
        </span>
      )}
    </Link>
  );
}

interface WeekSeason {
  season: SeasonSummary;
  start: number;
  end: number;
  continues: boolean;
}

function weekSeasons(
  seasons: SeasonSummary[],
  timezone: string,
  days: string[],
): WeekSeason[] {
  return seasons.flatMap((season) => {
    if (!season.startDate || !season.endDate) return [];
    const from = cityDate(season.startDate, timezone);
    const to = cityDate(season.endDate, timezone);
    if (to < days[0] || from > days[6]) return [];
    return [
      {
        season,
        start: from <= days[0] ? 1 : days.indexOf(from) + 1,
        end: to >= days[6] ? 7 : days.indexOf(to) + 1,
        continues: to > days[6],
      },
    ];
  });
}

function SeasonRow({
  season,
  start,
  end,
  continues,
  timezone,
}: WeekSeason & { timezone: string }) {
  const dates = formatSeasonDates(season, timezone);
  return (
    <Link
      href={`/seasons/${encodeURIComponent(season.slug)}`}
      style={{ gridColumn: `${start} / ${end + 1}` }}
      className="flex min-w-0 items-center gap-3 border-t-2 border-red bg-cream py-2 pr-4 pl-3 font-courier tracking-cou text-red uppercase transition-colors hover:bg-blush focus-visible:outline-2 focus-visible:outline-red"
    >
      <DateCircle className="size-8 text-xs">
        {formatDay(cityDate(season.startDate!, timezone), "dd")}
      </DateCircle>
      <span className="min-w-0 truncate text-xs">
        In the diary · {season.name}
        {dates && ` · ${dates}`}
      </span>
      {continues && (
        <span className="ml-auto flex shrink-0 items-center gap-1 text-[11px]">
          Continues
          <ArrowRight size={12} aria-hidden="true" />
        </span>
      )}
    </Link>
  );
}

function WeekKey() {
  const item = "flex items-center gap-2";
  return (
    <ul
      aria-label="Calendar key"
      className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-4 font-courier text-xs tracking-cou uppercase"
    >
      <li className={item}>
        <span
          aria-hidden="true"
          className="mb-0.5 block size-2 rounded-full bg-red"
        />
        Public
      </li>
      <li className={item}>
        <span
          aria-hidden="true"
          className="mb-0.5 block size-2 rounded-full border border-red"
        />
        Private or invitation only
      </li>
      <li className={item}>
        <span
          aria-hidden="true"
          className="mb-0.5 block size-4.5 rounded-full border-[1.5px] border-red"
        />
        Today
      </li>
    </ul>
  );
}
