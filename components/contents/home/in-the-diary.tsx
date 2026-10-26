import Link from "next/link";

import FadeUpText from "@/components/animations/fade-up-text";
import SectionWrapper from "@/components/layout/section-wrapper";
import DateCircle from "@/components/ui/date-circle";
import { DEFAULT_CITY_TIMEZONE } from "@/constants/nav";
import { cityDate, formatDay } from "@/lib/events/event-list";
import { formatSeasonDates } from "@/lib/events/season-dates";
import type { UpcomingSeason } from "@/requests/seasons/get-upcoming-seasons";

export default function InTheDiary({ seasons }: { seasons: UpcomingSeason[] }) {
  return (
    <section
      aria-labelledby="in-the-diary-heading"
      className="w-full bg-cream text-ink"
    >
      <SectionWrapper className="gap-10 lg:flex-row lg:gap-20">
        <div className="flex flex-col gap-6 text-red lg:w-95 lg:shrink-0">
          <FadeUpText
            as="h2"
            id="in-the-diary-heading"
            text="In the diary"
            className="font-montreal text-5xl font-medium tracking-mono uppercase sm:text-6xl lg:text-8xl"
          />
          <FadeUpText
            text="Major dates and seasons, from investor forums to fashion weeks. The first day is circled."
            delay={0.1}
            className="max-w-85 font-montreal text-lg sm:text-2xl"
          />
        </div>

        {seasons.length ? (
          <ul className="flex min-w-0 flex-1 flex-col">
            {seasons.map((season) => {
              const timezone = season.city?.timezone ?? DEFAULT_CITY_TIMEZONE;
              const dates = formatSeasonDates(season, timezone);
              const firstDay = season.startDate
                ? formatDay(cityDate(season.startDate, timezone), "dd")
                : null;
              return (
                <li key={season.id} className="border-t border-red">
                  <Link
                    href={`/seasons/${encodeURIComponent(season.slug)}`}
                    className="group/season flex items-center gap-4 py-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red sm:gap-7"
                  >
                    <DateCircle className="max-sm:size-12 max-sm:text-base">
                      {firstDay}
                    </DateCircle>
                    <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-7">
                      <span className="font-courier text-sm sm:w-47.5 sm:shrink-0 sm:text-lg">
                        {dates}
                      </span>
                      <span className="font-montreal text-xl font-medium tracking-mono uppercase transition-colors group-hover/season:text-red sm:flex-1 sm:text-[26px]">
                        {season.name}
                      </span>
                    </span>
                    {season.city && (
                      <span className="shrink-0 font-courier text-xs tracking-cou uppercase sm:text-sm">
                        {season.city.name}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="flex-1 border-t border-red pt-5 font-courier text-sm tracking-cou uppercase">
            Nothing in the diary yet.
          </p>
        )}
      </SectionWrapper>
    </section>
  );
}
