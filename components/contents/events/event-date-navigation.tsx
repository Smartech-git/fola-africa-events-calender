"use client";

import { useState, useTransition, type RefObject } from "react";

import { useLenis } from "lenis/react";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";

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
  const [isPending, startTransition] = useTransition();
  const [pendingDirection, setPendingDirection] = useState<number>();
  const loading = (direction: number) =>
    isPending && pendingDirection === direction;
  const activeDate = date ?? today;
  const step = view === "week" ? 7 : 1;
  const unit = view === "month" ? "month" : view === "week" ? "week" : "day";
  const shift = (direction: number) =>
    view === "month"
      ? shiftMonth(activeDate, direction)
      : shiftDate(activeDate, direction * step);
  const navigate = (direction: number) => {
    setPendingDirection(direction);
    // The transition stays pending until the new period has rendered.
    startTransition(() =>
      handleParamSet(calendarDateParams(view, shift(direction))),
    );
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
        className="rounded-full border-red pl-2 text-red max-sm:pr-0"
        aria-label={`Previous ${unit}`}
        aria-busy={loading(-1) || undefined}
        startContent={
          loading(-1) ? (
            <NavSpinner />
          ) : (
            <ChevronLeft size={14} aria-hidden="true" />
          )
        }
        onPress={() => navigate(-1)}
      >
        <HoverText text="Previous" className="max-sm:hidden" />
      </Button>
      <Button
        variant="bordered"
        size="xs"
        className="rounded-full border-red pr-2 text-xs text-red max-sm:pl-0"
        aria-label={`Next ${unit}`}
        aria-busy={loading(1) || undefined}
        endContent={
          loading(1) ? (
            <NavSpinner />
          ) : (
            <ChevronRight size={14} aria-hidden="true" />
          )
        }
        onPress={() => navigate(1)}
      >
        <HoverText text="Next" className="max-sm:hidden" />
      </Button>
    </div>
  );
}

function NavSpinner() {
  return (
    <LoaderCircle
      size={14}
      aria-hidden="true"
      className="shrink-0 animate-spin animate-duration-500"
    />
  );
}
