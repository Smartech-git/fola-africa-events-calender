"use client";

import type { RefObject } from "react";

import { useLenis } from "lenis/react";

import HoverText from "@/components/animations/hover-text";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import {
  EVENTS_LAYOUT,
  EVENTS_LAYOUT_KEY,
  FILTER_KEYS,
} from "@/constants/filters";
import { useRouteParam } from "@/hooks/use-route-param";
import { shiftDate } from "@/lib/events/event-list";
import { cn } from "@/lib/utils";

interface Props {
  date?: string;
  today: string;
  scrollTarget?: RefObject<HTMLElement | null>;
}

export default function EventLayout({ date, today, scrollTarget }: Props) {
  const lenis = useLenis();
  const activeDate = date ?? today;
  const { handleParamSet } = useRouteParam();
  const navigate = (date: string) => {
    handleParamSet({
      [EVENTS_LAYOUT_KEY]: "list",
      [FILTER_KEYS.date]: date,
      [FILTER_KEYS.dateFrom]: undefined,
      [FILTER_KEYS.dateTo]: undefined,
      [FILTER_KEYS.page]: undefined,
    });
    if (scrollTarget?.current)
      lenis?.scrollTo(scrollTarget?.current, { offset: -50, immediate: true });
  };

  return (
    <SectionWrapper className="flex-col justify-between gap-4 py-2 sm:py-2 lg:flex-row lg:items-center">
      <div role="group" aria-label="Calendar view" className="flex gap-8">
        {EVENTS_LAYOUT.map((item) => (
          <Button
            key={item.value}
            onPress={() => handleParamSet(EVENTS_LAYOUT_KEY, item.value)}
            disabled={item.value !== "list"}
            aria-pressed={item.value === "list"}
            title={
              item.value === "list"
                ? "List view"
                : `${item.label} view is coming soon`
            }
            variant="flat"
            size="fit"
            className={cn(
              "px-0 py-1 text-xs sm:px-0",
              item.value === "list" && "border-b-2 border-primary",
            )}
          >
            <HoverText text={item.label} />
          </Button>
        ))}
      </div>
      <div
        role="group"
        aria-label="Date navigation"
        className="flex flex-wrap gap-4"
      >
        <Button
          variant="flat"
          size="fit"
          className="text-xs"
          aria-label="Previous day"
          onPress={() => navigate(shiftDate(activeDate, -1))}
        >
          <HoverText text={`Previous`} />
        </Button>
        <Button
          variant="flat"
          size="fit"
          className="text-xs"
          onPress={() => navigate(today)}
        >
          <HoverText text={`Today`} />
        </Button>
        <Button
          variant="flat"
          size="fit"
          className="text-xs"
          aria-label="Next day"
          onPress={() => navigate(shiftDate(activeDate, 1))}
        >
          <HoverText text={`Next`} />
        </Button>
      </div>
    </SectionWrapper>
  );
}
