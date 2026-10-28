"use client";

import type { ReactNode } from "react";

import HoverText from "@/components/animations/hover-text";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { EVENTS_LAYOUT, FILTER_KEYS } from "@/constants/filters";
import { useRouteParam } from "@/hooks/use-route-param";
import { calendarDateParams, type CalendarView } from "@/lib/events/event-week";
import { cn } from "@/lib/utils";

interface Props {
  view: CalendarView;
  date: string;
  today: string;
  children: ReactNode;
}

export default function EventLayout({ view, date, today, children }: Props) {
  const { handleParamSet } = useRouteParam();

  return (
    <SectionWrapper className="flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2 sm:py-4">
      <div
        role="group"
        aria-label="Calendar view"
        className="flex gap-2"
      >
        {EVENTS_LAYOUT.map((item) => (
          <Button
            key={item.value}
            onPress={() =>
              handleParamSet(
                item.value === "week" || item.value === "month"
                  ? calendarDateParams(item.value, date)
                  : item.value === "day"
                    ? calendarDateParams("day", today)
                    : {
                        [FILTER_KEYS.eventLayoutKey]: "list",
                        [FILTER_KEYS.date]: undefined,
                        [FILTER_KEYS.page]: undefined,
                      },
              )
            }
            aria-pressed={item.value === view}
            variant={item.value === view ? "ink" : "bordered"}
            size="xs"
          >
            <HoverText text={item.label} />
          </Button>
        ))}
      </div>
      {children}
    </SectionWrapper>
  );
}
