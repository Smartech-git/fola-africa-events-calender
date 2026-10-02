"use client";

import Link from "next/link";

import { ArrowLeft, Dot } from "lucide-react";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { shareLink } from "@/lib/events/event-actions";
import { formatSeasonDates } from "@/lib/events/season-dates";
import type { SeasonsHeader as SeasonsHeaderData } from "@/requests/seasons/get-seasons-header";

export default function SeasonsHeader({
  data: { city, season },
}: {
  data: SeasonsHeaderData;
}) {
  const dates = formatSeasonDates(season, city.timezone, true);

  return (
    <SectionWrapper>
      <Link
        className="relative z-10 w-fit"
        href={`/events/${encodeURIComponent(city.slug)}`}
      >
        <Button
          startContent={<ArrowLeft size={12} />}
          variant="flat"
          size="fit"
        >
          <HoverText text="Back to events" />
        </Button>
      </Link>

      <div className="mt-8 flex w-full flex-col justify-between gap-8 sm:flex-row">
        <div className="flex-wrap items-center space-y-2">
          <FadeUpText
            as="h1"
            className="relative z-10 w-full font-apris text-4xl text-primary uppercase sm:text-6xl lg:text-7xl"
            text={season.name}
          />
          <div className="flex flex-col gap-x-4 gap-y-2 sm:flex-row sm:items-center">
            <p className="flex flex-wrap items-center text-xs uppercase sm:text-xs">
              {dates && (
                <>
                  <span>{dates}</span>
                  <Dot
                    size={24}
                    className="shrink-0 text-primary"
                    aria-hidden="true"
                  />
                </>
              )}
              <span>{city.name}</span>
              <Dot
                size={24}
                className="shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>Times in {city.timezoneLabel || city.timezone}</span>
            </p>
            <p className="w-fit bg-secondary px-2 py-0.5 text-xxs uppercase sm:text-xs">
              {season.status === "final" ? "Final" : "Provisional"}
            </p>
          </div>
        </div>
        <Button
          className="mt-1 max-sm:hidden"
          variant="link"
          size="fit"
          onPress={() => {
            void shareLink(
              season.name,
              `/seasons/${encodeURIComponent(season.slug)}`,
            );
          }}
        >
          <HoverText text="Share season" />
        </Button>
      </div>

      {season.description && (
        <p className="mt-4 text-xs uppercase sm:mt-8 sm:text-xs">
          {season.description}
        </p>
      )}
      <Button
        className="mt-8 sm:hidden"
        variant="link"
        size="fit"
        onPress={() => {
          void shareLink(
            season.name,
            `/seasons/${encodeURIComponent(season.slug)}`,
          );
        }}
      >
        <HoverText text="Share season" />
      </Button>
    </SectionWrapper>
  );
}
