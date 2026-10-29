"use client";

import { useMemo } from "react";

import Link from "next/link";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import SurTitle from "@/components/common/sur-title";
import EventDots from "@/components/contents/events/event-dots";
import EventListCard from "@/components/contents/events/event-list-card";
import NothingHereCard from "@/components/contents/events/nothing-here-card";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { FILTER_KEYS } from "@/constants/filters";
import { useRouteParam } from "@/hooks/use-route-param";
import {
  dayPath,
  formatDay,
  groupEventsByDay,
  shiftDate,
} from "@/lib/events/event-list";
import { cn } from "@/lib/utils";
import type { PublicEvent } from "@/requests/events/get-events-by-city";

interface Props {
  city: { slug: string; name: string; timezone: string };
  weekStart: string;
  today: string;
  events: PublicEvent[];
}

const happenings = (count: number) =>
  `${count} ${count === 1 ? "happening" : "happenings"}`;

export default function ThisWeek({ city, weekStart, today, events }: Props) {
  const { getFilterValue, handleParamSet } = useRouteParam();
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => shiftDate(weekStart, index)),
    [weekStart],
  );
  const byDay = useMemo(() => {
    const groups = groupEventsByDay(events, city.timezone, {
      from: days[0],
      to: days[6],
    });
    return new Map(groups.map((group) => [group.date, group.events]));
  }, [events, city.timezone, days]);

  const requested = getFilterValue(FILTER_KEYS.homeDate);
  const selected = requested && days.includes(requested) ? requested : today;
  const selectedEvents = byDay.get(selected) ?? [];
  const range = `${formatDay(days[0], "dd MMM")} – ${formatDay(days[6], "dd MMM")}`;
  const dayLabel =
    selected === today ? "Today" : formatDay(selected, "EEE dd MMM");

  return (
    <section
      aria-labelledby="this-week-heading"
      className="w-full bg-white text-ink"
    >
      <SectionWrapper className="gap-8 sm:gap-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5">
            <SurTitle dot content={`${city.name} · This week · ${range}`} />
            <FadeUpText
              as="h2"
              id="this-week-heading"
              text={`What’s happening in ${city.name}?`}
              className="font-montreal text-4xl font-medium tracking-mono sm:text-[64px]"
            />
          </div>

          <ol aria-label="Choose a day" className="grid grid-cols-7 lg:flex">
            {days.map((day) => {
              const count = byDay.get(day)?.length ?? 0;
              const chosen = day === selected;
              const isToday = day === today;
              return (
                <li key={day} className="flex justify-center lg:w-16">
                  <button
                    type="button"
                    aria-pressed={chosen}
                    aria-label={`${formatDay(day, "EEEE d MMMM")}${isToday ? ", today" : ""}: ${happenings(count)}`}
                    onClick={() => handleParamSet(FILTER_KEYS.homeDate, day)}
                    className="group/day flex cursor-pointer flex-col items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
                  >
                    <span
                      className={cn(
                        "font-courier text-sm tracking-cou uppercase",
                        (chosen || isToday) && "text-red",
                      )}
                    >
                      <span className="lg:hidden">
                        {formatDay(day, "EEEEE")}
                      </span>
                      <span className="max-lg:hidden">
                        {formatDay(day, "EEE")}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex size-11 items-center justify-center rounded-full border-[1.5px] font-courier text-lg tracking-cou transition-colors sm:size-16 sm:text-2xl",
                        chosen
                          ? "border-red text-red"
                          : "border-transparent group-hover/day:border-ink/30",
                      )}
                    >
                      {formatDay(day, "d")}
                    </span>
                    <EventDots
                      events={byDay.get(day) ?? []}
                      className="h-1.75"
                    />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-ink pb-3.5 font-courier text-sm tracking-cou uppercase">
          <p aria-live="polite" className="text-red">
            {dayLabel} · {happenings(selectedEvents.length)}
          </p>
          <Link
            href={dayPath(city.slug, selected)}
            className="transition-colors hover:text-red focus-visible:outline-2 focus-visible:outline-red"
          >
            <span className="lg:hidden">Filter</span>
            <span className="max-lg:hidden">All industries · All access</span>
          </Link>
        </div>

        {selectedEvents.length ? (
          <div className="-mt-8 flex flex-col sm:-mt-10">
            {selectedEvents.map((event) => (
              <EventListCard
                key={event.id}
                event={event}
                city={city.slug}
                timezone={city.timezone}
                date={selected}
              />
            ))}
          </div>
        ) : (
          <NothingHereCard
            as="h3"
            label={`${city.name} · ${formatDay(selected, "EEE dd MMM")}`}
          />
        )}

        <Link
          href={`/calendar/${encodeURIComponent(city.slug)}`}
          className="w-full sm:w-fit"
        >
          <Button variant="ink" size="md" className="w-full">
            <HoverText text="See the full calendar" />
          </Button>
        </Link>
      </SectionWrapper>
    </section>
  );
}
