"use client";

import { useSyncExternalStore } from "react";

import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import SectionWrapper from "@/components/layout/section-wrapper";
import type { CityOverview } from "@/requests/get-cities";

const TICK = 15_000;

// The minute, shared by every clock; nothing on the server, so no mismatch.
const subscribe = (onChange: () => void) => {
  const timer = setInterval(onChange, TICK);
  return () => clearInterval(timer);
};
const minute = () => Math.floor(Date.now() / TICK) * TICK;
const noClock = () => null;

function LocalTime({ city, now }: { city: CityOverview; now: number | null }) {
  const time =
    now === null
      ? "--:--"
      : new Intl.DateTimeFormat("en-GB", {
          timeZone: city.timezone,
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }).format(now);
  return (
    <span className="flex items-center gap-2 font-courier text-xs tracking-cou uppercase sm:text-sm">
      <span
        aria-hidden="true"
        className="mb-0.5 size-2 shrink-0 animate-pulse rounded-full bg-red motion-reduce:animate-none"
      />
      <span>
        <span className="sr-only">Local time </span>
        {time} {city.timezoneLabel}
      </span>
    </span>
  );
}

export default function LaunchCities({ cities }: { cities: CityOverview[] }) {
  const now = useSyncExternalStore(subscribe, minute, noClock);

  return (
    <section
      aria-labelledby="about-cities"
      className="w-full bg-ink text-white"
    >
      <SectionWrapper className="gap-10 sm:gap-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-40">
          <SurTitle
            as="h2"
            id="about-cities"
            content="Launching initially across"
            className="text-cream lg:w-75 lg:shrink-0"
          />
          <FadeUpText
            text="Where the calendar begins. More cities will follow."
            className="min-w-0 flex-1 font-montreal text-3xl font-medium tracking-mono sm:text-5xl"
          />
        </div>

        {cities.length > 0 && (
          <ul className="grid grid-cols-1 gap-px bg-white/25 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <li key={city.id} className="bg-ink">
                <Link
                  href={`/calendar/${encodeURIComponent(city.slug)}`}
                  className="group/city flex h-full flex-col justify-between gap-6 py-6 transition-colors duration-300 hover:bg-red focus-visible:bg-red focus-visible:outline-none sm:min-h-60 sm:gap-8 sm:p-6"
                >
                  <span className="flex items-start justify-between gap-4">
                    <LocalTime city={city} now={now} />
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-6 shrink-0 transition-transform duration-300 group-hover/city:translate-x-1 group-hover/city:-translate-y-1 motion-reduce:transition-none"
                    />
                  </span>
                  <span className="flex flex-col gap-2">
                    <span className="font-montreal text-4xl font-medium tracking-mono uppercase sm:text-5xl">
                      {city.name}
                    </span>
                    <span className="font-courier text-xs tracking-cou text-cream uppercase transition-colors group-hover/city:text-white sm:text-sm">
                      {city.country} · {city.counts.thisWeek}{" "}
                      {city.counts.thisWeek === 1 ? "happening" : "happenings"}{" "}
                      this week
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionWrapper>
    </section>
  );
}
