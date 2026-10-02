"use client";

import Link from "next/link";

import { ChevronDown } from "lucide-react";

import Button from "@/components/ui/button";
import {
  Dropdown,
  DropdownItem_,
  DropdownMenu,
  DropdownTrigger,
} from "@/components/ui/drop-down";
import { formatDay } from "@/lib/events/event-list";
import type { SeasonSummary } from "@/requests/helpers/types";

export default function SeasonBand({
  seasons,
  date,
}: {
  seasons: SeasonSummary[];
  date: string;
}) {
  const first = seasons[0];
  if (!first) return null;

  return (
    <div className="mb-2 flex h-7 min-w-0 items-center bg-secondary">
      <Link
        href={`/seasons/${encodeURIComponent(first.slug)}`}
        className="flex h-full min-w-0 flex-1 items-center px-2 text-xxs uppercase hover:text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:text-xs"
        title={first.name}
      >
        <span className="truncate">{first.name}</span>
      </Link>
      {seasons.length > 1 && (
        <Dropdown>
          <DropdownTrigger asChild>
            <Button
              variant="flat"
              size="fit"
              className="h-7 shrink-0 px-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
              aria-label={`Show all ${seasons.length} seasons for ${formatDay(date, "d MMMM yyyy")}`}
            >
              <ChevronDown size={12} aria-hidden="true" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Seasons on these dates"
            classNames={{ base: "max-w-72" }}
            itemClasses={{ title: "whitespace-normal" }}
          >
            {seasons.map((season) => (
              <DropdownItem_
                key={season.id}
                as={Link}
                href={`/seasons/${encodeURIComponent(season.slug)}`}
                textValue={season.name}
              >
                {season.name}
              </DropdownItem_>
            ))}
          </DropdownMenu>
        </Dropdown>
      )}
    </div>
  );
}
