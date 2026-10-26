"use client";
import Link from "next/link";

import HoverText from "@/components/animations/hover-text";
import Button from "@/components/ui/button";
import { FILTER_KEYS } from "@/constants/filters";
import { DEFAULT_CITY_SLUG } from "@/constants/nav";
import { useRouteParam } from "@/hooks/use-route-param";

export default function ExploreEvent() {
  const { getFilterValue } = useRouteParam();

  return (
    <Link
      className="w-fit max-sm:w-full"
      href={`/calendar/${getFilterValue(FILTER_KEYS.city) ?? DEFAULT_CITY_SLUG}`}
    >
      <Button size="sm" className="max-sm:w-full!">
        <HoverText text="See what’s happening" />
      </Button>
    </Link>
  );
}
