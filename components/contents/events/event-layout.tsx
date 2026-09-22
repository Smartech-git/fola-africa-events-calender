"use client";

import type { ReactNode } from "react";

import HoverText from "@/components/animations/hover-text";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { EVENTS_LAYOUT, EVENTS_LAYOUT_KEY } from "@/constants/filters";
import { useRouteParam } from "@/hooks/use-route-param";
import { cn } from "@/lib/utils";

export default function EventLayout({ children }: { children?: ReactNode }) {
  const { handleParamSet } = useRouteParam();
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
            size="sm"
            className={cn(
              "min-h-11 px-0 py-0 text-xs focus-visible:outline-2 focus-visible:outline-primary sm:px-0",
              item.value === "list" && "border-b-2 border-primary",
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
