"use client";

import type { RefObject } from "react";

import { useLenis } from "lenis/react";

import HoverText from "@/components/animations/hover-text";
import Button from "@/components/ui/button";
import { useRouteParam } from "@/hooks/use-route-param";
import { shiftDate } from "@/lib/events/event-list";
import { calendarDateParams, type CalendarView } from "@/lib/events/event-week";

interface Props {
  view: CalendarView;
  date?: string;
  today: string;
  scrollTarget?: RefObject<HTMLElement | null>;
}

export default function EventDateNavigation({
  view,
  date,
  today,
  scrollTarget,
}: Props) {
  const { handleParamSet } = useRouteParam();
  const lenis = useLenis();
  const activeDate = date ?? today;
  const step = view === "week" ? 7 : 1;
  const unit = view === "week" ? "week" : "day";
  const navigate = (target: string) => {
    handleParamSet(calendarDateParams(view, target));
    if (scrollTarget?.current) {
      if (lenis)
        lenis.scrollTo(scrollTarget.current, { offset: -50, immediate: true });
      else scrollTarget.current.scrollIntoView({ block: "start" });
    }
  };

  return (
    <div
      role="group"
      aria-label="Date navigation"
      className="flex flex-wrap gap-4 sm:gap-8"
    >
      <Button
        variant="flat"
        size="fit"
        className="text-xs border-b-2 border-b-transparent focus-visible:outline-2 focus-visible:outline-primary"
        aria-label={`Previous ${unit}`}
        onPress={() => navigate(shiftDate(activeDate, -step))}
      >
        <HoverText text="Previous" />
      </Button>
      <Button
        variant="flat"
        size="fit"
        className="text-xs border-b-2 border-b-transparent focus-visible:outline-2 focus-visible:outline-primary"
        onPress={() => navigate(today)}
      >
        <HoverText text="Today" />
      </Button>
      <Button
        variant="flat"
        size="fit"
        className="text-xs border-b-2 border-b-transparent focus-visible:outline-2 focus-visible:outline-primary"
        aria-label={`Next ${unit}`}
        onPress={() => navigate(shiftDate(activeDate, step))}
      >
        <HoverText text="Next" />
      </Button>
    </div>
  );
}
