"use client";

import { Fragment, useRef, useTransition } from "react";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ChevronDown } from "lucide-react";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import EventDateNavigation from "@/components/contents/events/event-date-navigation";
import EventLayout from "@/components/contents/events/event-layout";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import {
  Dropdown,
  DropdownItem_,
  DropdownMenu,
  DropdownTrigger,
} from "@/components/ui/drop-down";
import { useRouteParam } from "@/hooks/use-route-param";
import { formatDay, groupEventsByDay } from "@/lib/events/event-list";
import {
  getMonthQuery,
  monthSeasonDays,
  monthWeeks,
  weekSeasonBands,
} from "@/lib/events/event-month";
import { calendarDateParams } from "@/lib/events/event-week";
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

function SeasonBand({
  seasons,
  date,
}: {
  seasons: SeasonSummary[];
  date: string;
}) {
  if (!seasons.length) return null;
  const first = seasons[0];

  if (seasons.length === 1) {
    return (
      <div className="mb-2 flex h-7 items-center bg-secondary">
        <span className="block truncate px-2 py-1 text-xxs uppercase sm:text-xs">
          {first.name}
        </span>
      </div>
    );
  }
  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button
          variant="flat"
          size="fit"
          className="mb-2 h-7 w-full justify-between gap-1 bg-secondary px-2 text-left text-xxs font-normal sm:text-xs"
          aria-label={`${first.name}: show ${seasons.length - 1} more seasons for ${formatDay(date, "d MMMM yyyy")}`}
        >
          <span className="min-w-0 truncate">{first.name}</span>
          <ChevronDown size={12} className="shrink-0" aria-hidden="true" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Other seasons on these dates"
        classNames={{ base: "max-w-72" }}
        itemClasses={{ title: "whitespace-normal" }}
      >
        {seasons.map((season) => (
          <DropdownItem_ key={season.id} textValue={season.name}>
            {season.name}
          </DropdownItem_>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

export default function EventMonth({
  cityName,
  timezone,
  today,
  query,
  events,
  seasons,
  error,
  invalidFilters,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { clearAllParams } = useRouteParam();
  const [pending, startTransition] = useTransition();
  const weeks = monthWeeks(query.range.from);
  const counts = new Map(
    groupEventsByDay(events, timezone, query.range).map((day) => [
      day.date,
      day.events.length,
    ]),
  );
  const seasonDays = monthSeasonDays(seasons, timezone, query.range);
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
        className="min-w-0 sm:pt-0"
      >
        <header className="mb-4 space-y-2 sm:mb-8">
          <h2>
            <FadeUpText
              className="font-inter text-3xl uppercase sm:text-4xl"
              text={formatDay(query.range.from, "MMMM yyyy")}
            />
          </h2>
        </header>
        {error ? (
          <div role="alert" className="space-y-3 py-8">
            <p className="text-sm">{error}</p>
            <Button
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
              Select a date to open the day's full listing.
            </p>
            <div
              role="region"
              aria-label="Monthly event calendar"
              tabIndex={0}
              className="w-full min-w-0 overflow-x-auto overscroll-x-contain pb-4 focus-visible:outline-2 focus-visible:outline-primary"
            >
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
                          className="px-2 pb-2 text-xs font-medium uppercase"
                        >
                          {day}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week) => (
                    <Fragment key={week[0]}>
                      <tr>
                        {weekSeasonBands(week, seasonDays).map((band) => (
                          <td
                            key={band.date}
                            colSpan={band.span}
                            className="p-0 align-top"
                          >
                            <SeasonBand
                              seasons={band.seasons}
                              date={band.date}
                            />
                          </td>
                        ))}
                      </tr>
                      <tr>
                        {week.map((date) => {
                          const inMonth =
                            date >= query.range.from && date <= query.range.to;
                          const count = counts.get(date) ?? 0;
                          const content = (
                            <>
                              <time
                                dateTime={date}
                                className={cn(
                                  "block text-2xl leading-8 font-medium",
                                  !inMonth && "text-light-gray",
                                )}
                              >
                                {formatDay(date, "d")}
                              </time>
                              <div className="mt-3 flex min-h-7 items-center gap-1 text-xs uppercase sm:text-sm">
                                {inMonth && (
                                  <>
                                    {count > 0 && (
                                      <div className="flex h-5 min-w-5 items-center justify-center bg-secondary text-xs font-bold">
                                        {count}
                                      </div>
                                    )}
                                    <HoverText
                                      text={`${count === 1 ? "event" : "events"}`}
                                      className={cn(
                                        "mt-0.5 font-apris text-primary",
                                        count === 0 && "text-light-gray",
                                      )}
                                    />
                                  </>
                                )}
                              </div>
                              <div className="mt-3 h-px bg-light-gray" />
                            </>
                          );
                          return (
                            <td
                              key={date}
                              className="min-w-20 p-0 pb-4 align-top"
                            >
                              {inMonth ? (
                                <Link
                                  href={dayHref(date)}
                                  scroll={false}
                                  aria-current={
                                    date === today ? "date" : undefined
                                  }
                                  aria-label={`${formatDay(date, "EEEE d MMMM yyyy")}, ${count} ${count === 1 ? "event" : "events"}: view day`}
                                  className={cn(
                                    "block border border-transparent px-2 pt-3 pb-2 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
                                    date === today && "border-primary",
                                  )}
                                >
                                  {content}
                                </Link>
                              ) : (
                                <div
                                  className="px-2 pt-3 pb-2"
                                  aria-label={`${formatDay(date, "d MMMM yyyy")}, outside this month`}
                                >
                                  {content}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </SectionWrapper>
    </div>
  );
}
