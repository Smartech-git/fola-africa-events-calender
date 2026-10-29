"use client";

import type { RefObject } from "react";

import { useLenis } from "lenis/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import HoverText from "@/components/animations/hover-text";
import Button from "@/components/ui/button";
import { useRouteParam } from "@/hooks/use-route-param";
import { shiftDate } from "@/lib/events/event-list";
import { shiftMonth } from "@/lib/events/event-month";
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
  const unit = view === "month" ? "month" : view === "week" ? "week" : "day";
  const shift = (direction: number) =>
    view === "month"
      ? shiftMonth(activeDate, direction)
      : shiftDate(activeDate, direction * step);
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
      className="flex flex-wrap gap-2 sm:gap-4"
    >
      <Button
        variant="bordered"
        size="xs"
        className="rounded-full border-red pl-2 max-sm:pr-0 text-red"
        aria-label={`Previous ${unit}`}
        startContent={<ChevronLeft size={14} aria-hidden="true" />}
        onPress={() => navigate(shift(-1))}
      >
        <HoverText text="Previous" className="max-sm:hidden" />
      </Button>
      <Button
        variant="bordered"
        size="xs"
        className="rounded-full border-red max-sm:pl-0 pr-2 text-xs text-red"
        aria-label={`Next ${unit}`}
        endContent={<ChevronRight size={14} aria-hidden="true" />}
        onPress={() => navigate(shift(1))}
      >
        <HoverText text="Next" className="max-sm:hidden" />
      </Button>
    </div>
  );
}
