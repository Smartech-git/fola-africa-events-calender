"use client";
import Link from "next/link";

import HoverText from "@/components/animations/hover-text";
import Button from "@/components/ui/button";
import { CITIES_ID_KEY } from "@/constants/filters";
import { useRouteParam } from "@/hooks/use-route-param";

export default function ExploreEvent() {
  const { getFilterValue } = useRouteParam();

  return (
    <Link
      className="w-fit max-sm:w-full"
      href={`/events/${getFilterValue(CITIES_ID_KEY) ?? "lagos"}`}
    >
      <Button size="sm" className="max-sm:w-full!">
        <HoverText text="Explore events" />
      </Button>
    </Link>
  );
}
