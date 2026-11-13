"use client";

import { useState, useTransition, type ReactNode } from "react";

import { LoaderCircle } from "lucide-react";

import HoverText from "@/components/animations/hover-text";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { EVENTS_LAYOUT, FILTER_KEYS } from "@/constants/filters";
import { useRouteParam } from "@/hooks/use-route-param";
import { calendarDateParams, type CalendarView } from "@/lib/events/event-week";

interface Props {
  view: CalendarView;
  date: string;
  today: string;
  children: ReactNode;
}

export default function EventLayout({ view, date, today, children }: Props) {
  const { handleParamSet } = useRouteParam();
  const [isPending, startTransition] = useTransition();
  const [pendingView, setPendingView] = useState<string>();

  return (
    <SectionWrapper className="mb-4 flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-ink/20 py-3 md:py-4 lg:mb-6">
      <div role="group" aria-label="Calendar view" className="flex gap-2">
        {EVENTS_LAYOUT.map((item) => {
          const loading = isPending && pendingView === item.value;
          return (
            <Button
              key={item.value}
              onPress={() => {
                setPendingView(item.value);
                // The transition stays pending until the new view has rendered.
                startTransition(() =>
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
                  ),
                );
              }}
              aria-pressed={item.value === view}
              aria-busy={loading || undefined}
              variant={item.value === view ? "ink" : "bordered"}
              size="xs"
              endContent={
                loading && (
                  <LoaderCircle
                    size={14}
                    aria-hidden="true"
                    className="shrink-0 animate-spin animate-duration-500"
                  />
                )
              }
            >
              <HoverText text={item.label} />
            </Button>
          );
        })}
      </div>
      {children}
    </SectionWrapper>
  );
}
