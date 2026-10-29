"use client";

import { useSearchParams } from "next/navigation";

import HoverText from "@/components/animations/hover-text";
import Button from "@/components/ui/button";
import { FILTER_KEYS } from "@/constants/filters";
import { useRouteParam } from "@/hooks/use-route-param";
import { activeFilterLabels } from "@/lib/events/active-filters";
import { cn } from "@/lib/utils";

interface Props {
  includeDates?: boolean;
  as?: "h2" | "h3";
  className?: string;
}

export default function NothingMatchesCard({
  includeDates = true,
  as: Heading = "h2",
  className,
}: Props) {
  const searchParams = useSearchParams();
  const { clearAllParams, handleParamSet } = useRouteParam();
  const filters = activeFilterLabels(searchParams, { includeDates });

  return (
    <div
      role="status"
      className={cn(
        "flex w-full flex-col items-start gap-6 border-[1.5px] border-ink px-6 pt-8 pb-10 text-ink sm:px-12 sm:pt-12 sm:pb-14",
        className,
      )}
    >
      {filters.length > 0 && (
        <>
          <p className="font-courier text-sm tracking-cou text-red uppercase">
            Filters
          </p>
          <ul aria-label="Active filters" className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <li
                key={filter}
                className="rounded-full bg-ink px-3 py-2 font-courier text-xs tracking-cou whitespace-nowrap text-white uppercase"
              >
                {filter}
              </li>
            ))}
          </ul>
        </>
      )}
      <Heading className="font-montreal text-5xl leading-none font-medium tracking-mono text-red uppercase sm:text-7xl lg:text-[80px]">
        Nothing matches yet
      </Heading>
      <p className="font-montreal text-lg sm:text-2xl">
        Try another date or filter.
      </p>
      <Button
        variant="ink"
        size="md"
        className="w-full sm:w-fit"
        onPress={() =>
          includeDates
            ? clearAllParams()
            : handleParamSet({
                [FILTER_KEYS.search]: undefined,
                [FILTER_KEYS.industry]: undefined,
                [FILTER_KEYS.access]: undefined,
              })
        }
      >
        <HoverText text="Clear filters" />
      </Button>
    </div>
  );
}
