"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import SectionWrapper from "@/components/layout/section-wrapper";
import { DEFAULT_CITY_SLUG } from "@/constants/nav";
import { useCalendarToday } from "@/hooks/use-calendar-today";
import { cn } from "@/lib/utils";
import type { Cities as CitiesType, CitySummary } from "@/requests/get-cities";

interface Props {
  cities: CitiesType;
  headingLevel?: "h1" | "h2";
}

export default function Cities({ cities, headingLevel = "h2" }: Props) {
  return (
    <section
      id="cities"
      aria-labelledby="cities-heading"
      className="w-full bg-ink text-white"
    >
      <SectionWrapper className="gap-8 sm:gap-12">
        <div className="flex flex-col gap-3 sm:items-end">
          <FadeUpText
            id="cities-heading"
            as={headingLevel}
            text="What’s happening?"
            className="font-montreal text-5xl font-medium tracking-mono uppercase sm:text-8xl xl:text-[160px]"
          />
          <FadeUpText
            text="Choose a city."
            delay={0.15}
            className="w-fit font-montreal text-lg text-cream sm:text-2xl"
          />
        </div>

        <nav aria-label="Choose a city" className="w-full">
          {cities.data.length ? (
            <ul className="flex flex-col">
              {cities.data.map((city) => (
                <CityRow key={city.id} city={city} />
              ))}
            </ul>
          ) : (
            <FadeUpText
              text="New cities are on the way"
              className="py-6 font-courier text-sm tracking-cou uppercase"
            />
          )}
        </nav>
      </SectionWrapper>
    </section>
  );
}

function CityRow({ city }: { city: CitySummary }) {
  const { totalEvents } = useCalendarToday({ city });
  const current = city.slug === DEFAULT_CITY_SLUG;

  return (
    <li className="border-t border-white/90 last:border-b sm:last:border-b-0">
      <Link
        href={`/calendar/${encodeURIComponent(city.slug)}`}
        aria-label={`${city.name}${
          totalEvents !== undefined
            ? `, ${totalEvents} ${totalEvents === 1 ? "happening" : "happenings"} today`
            : ""
        }`}
        className="group/city flex items-center gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:gap-6 sm:py-5.5"
      >
        <span
          aria-hidden="true"
          className={cn(
            "size-4.5 shrink-0 rounded-full border-[1.5px] transition-colors duration-300 sm:size-7",
            current
              ? "border-red bg-red"
              : "border-white group-hover/city:border-red group-hover/city:bg-red group-focus-visible/city:border-red group-focus-visible/city:bg-red",
          )}
        />
        <HoverText
          text={city.name}
          className="font-montreal text-3xl font-medium tracking-mono uppercase sm:text-5xl xl:text-[64px]"
        />
        <span className="ml-auto flex shrink-0 items-center gap-4 sm:gap-6">
          {totalEvents !== undefined && (
            <span className="animate-fade font-courier text-xs tracking-cou text-cream uppercase sm:text-sm">
              {totalEvents}
              <span className="max-sm:hidden">
                {` ${totalEvents === 1 ? "happening" : "happenings"}`}
              </span>
              {" today"}
            </span>
          )}
          <ArrowRight
            aria-hidden="true"
            className="size-6 shrink-0 transition-transform duration-300 group-hover/city:translate-x-1.5 group-focus-visible/city:translate-x-1.5 motion-reduce:transition-none max-sm:hidden"
          />
        </span>
      </Link>
    </li>
  );
}
