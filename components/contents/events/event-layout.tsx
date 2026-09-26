"use client";

import type { ReactNode } from "react";

import HoverText from "@/components/animations/hover-text";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import {
  EVENTS_LAYOUT,
  EVENTS_LAYOUT_KEY,
  FILTER_KEYS,
} from "@/constants/filters";
import { useRouteParam } from "@/hooks/use-route-param";
import { calendarDateParams, type CalendarView } from "@/lib/events/event-week";
import { cn } from "@/lib/utils";

interface Props {
  view: CalendarView;
  date: string;
  children: ReactNode;
}

export default function EventLayout({ view, date, children }: Props) {
  const { handleParamSet } = useRouteParam();

  return (
    <SectionWrapper className="flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2 sm:py-2">
      <div
        role="group"
        aria-label="Calendar view"
        className="flex gap-4 sm:gap-8"
      >
        {EVENTS_LAYOUT.map((item) => (
          <Button
            key={item.value}
            onPress={() =>
              handleParamSet(
                item.value === "week" || item.value === "month"
                  ? calendarDateParams(item.value, date)
                  : {
                      [EVENTS_LAYOUT_KEY]: "list",
                      [FILTER_KEYS.page]: undefined,
                    },
              )
            }
            aria-pressed={item.value === view}
            variant="flat"
            size="fit"
            className={cn(
              "min-h-8 border-b-2 border-transparent px-0 text-xs focus-visible:outline-2 focus-visible:outline-primary sm:px-0 sm:py-1",
              item.value === view && "border-primary",
            )}
          >
            <HoverText text={item.label} />
          </Button>
        ))}
      </div>
      {children}
    </SectionWrapper>
  );
}
