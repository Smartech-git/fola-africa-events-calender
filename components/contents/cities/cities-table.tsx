import Link from "next/link";

import { ArrowRight } from "lucide-react";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import SectionWrapper from "@/components/layout/section-wrapper";
import DateCircle from "@/components/ui/date-circle";
import { DEFAULT_CITY_SLUG } from "@/constants/nav";
import { cityDate, formatDay } from "@/lib/events/event-list";
import { formatSeasonDates } from "@/lib/events/season-dates";
import { cn } from "@/lib/utils";
import type { CityOverview } from "@/requests/get-cities";

// Desktop column widths, shared by the heading row and every city row.
const COLUMNS = {
  number: "lg:w-14",
  today: "lg:w-30",
  week: "lg:w-35",
  diary: "lg:w-80",
  arrow: "lg:w-6",
};

const caps = "font-courier tracking-cou uppercase";

interface Props {
  cities: CityOverview[];
  currentCity?: string;
}

export default function CitiesTable({
  cities,
  currentCity = DEFAULT_CITY_SLUG,
}: Props) {
  // The visitor's city leads; the rest keep their order.
  const ordered = [
    ...cities.filter((city) => city.slug === currentCity),
    ...cities.filter((city) => city.slug !== currentCity),
  ];

  return (
    <SectionWrapper className="gap-0">
      <div
        aria-hidden="true"
        className={cn(
          caps,
          "flex gap-8 pt-5 pb-3 text-sm text-red max-lg:hidden",
        )}
      >
        <span className={COLUMNS.number} />
        <span className="flex-1">City</span>
        <span className={COLUMNS.today}>Today</span>
        <span className={COLUMNS.week}>This week</span>
        <span className={COLUMNS.diary}>Next in the diary</span>
        <span className={COLUMNS.arrow} />
      </div>

      {ordered.length ? (
        <ul className="flex flex-col">
          {ordered.map((city, index) => (
            <CityRow
              key={city.id}
              city={city}
              index={index}
              current={city.slug === currentCity}
            />
          ))}
        </ul>
      ) : (
        <FadeUpText
          text="New cities are on the way"
          className={cn(caps, "py-6 text-sm")}
        />
      )}
    </SectionWrapper>
  );
}

function CityRow({
  city,
  index,
  current,
}: {
  city: CityOverview;
  index: number;
  current: boolean;
}) {
  const season = city.nextSeason;
  const seasonDates = season ? formatSeasonDates(season, city.timezone) : null;
  const seasonDay = season?.startDate
    ? formatDay(cityDate(season.startDate, city.timezone), "dd")
    : null;
  const { today, thisWeek } = city.counts;

  return (
    <li className={cn(!current && "border-t last:border-b border-ink")}>
      <Link
        href={`/calendar/${encodeURIComponent(city.slug)}`}
        aria-label={`${city.name}: ${today} today, ${thisWeek} this week${
          season ? `. Next in the diary: ${season.name}` : ""
        }`}
        className={cn(
          "group/city flex flex-wrap items-center gap-x-8 gap-y-3 px-2 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red lg:flex-nowrap lg:px-6 lg:py-7",
          current ? "bg-red" : "text-ink hover:bg-cream",
        )}
      >
        <span
          className={cn(
            caps,
            COLUMNS.number,
            "text-[22px] max-lg:hidden",
            current && "text-white",
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-3 lg:gap-5">
            <span
              aria-hidden="true"
              className={cn(
                "size-4 shrink-0 rounded-full lg:size-8",
                current ? "bg-white" : "bg-red",
              )}
            />
            <HoverText
              text={city.name}
              className={cn(
                "font-montreal text-3xl font-medium tracking-mono uppercase lg:text-4xl",
                current && "text-white",
              )}
            />
          </div>
          <span
            className={cn(
              caps,
              "text-[11px] sm:text-[13px]",
              current ? "text-white/85" : "text-ink",
            )}
          >
            {city.country} · {city.timezoneLabel || city.timezone}
          </span>
        </div>

        <ArrowRight
          aria-hidden="true"
          className={cn(
            COLUMNS.arrow,
            current && "text-white",
            "size-6 shrink-0 transition-transform duration-300 group-hover/city:translate-x-1.5 group-focus-visible/city:translate-x-1.5 motion-reduce:transition-none lg:order-last",
          )}
        />

        <div className="flex gap-4 max-lg:basis-full lg:contents">
          <Count
            value={today}
            label="today"
            className={COLUMNS.today}
            tone={current ? "white" : "red"}
          />
          <Count
            value={thisWeek}
            label="this week"
            className={COLUMNS.week}
            tone={current ? "white" : "ink"}
          />
        </div>

        <div
          className={cn(
            COLUMNS.diary,
            "flex items-center gap-3.5 max-lg:basis-full",
          )}
        >
          {season ? (
            <>
              <DateCircle
                variant={current ? "outlineWhite" : "outline"}
                className="max-lg:size-8 max-lg:text-sm"
              >
                {seasonDay}
              </DateCircle>
              <span className="flex min-w-0 flex-col gap-1">
                <span
                  className={cn(
                    "font-montreal text-sm font-medium uppercase lg:text-lg",
                    current && "text-white",
                  )}
                >
                  {season.name}
                </span>
                {seasonDates && (
                  <span
                    className={cn(
                      caps,
                      "text-xxs lg:text-xs",
                      current ? "text-white/70" : "text-ink/70",
                    )}
                  >
                    {seasonDates}
                  </span>
                )}
              </span>
            </>
          ) : (
            <span
              className={cn(
                caps,
                "text-xs",
                current ? "text-white/70" : "text-ink/50",
              )}
            >
              Nothing in the diary yet
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}

function Count({
  value,
  label,
  tone,
  className,
}: {
  value: number;
  label: string;
  tone: "white" | "red" | "ink";
  className?: string;
}) {
  return (
    <span
      className={cn(
        caps,
        "flex items-baseline gap-1.5 lg:flex-col lg:items-start lg:gap-0.5",
        className,
      )}
    >
      <span
        className={cn(
          "text-xs lg:text-5xl lg:leading-none",
          tone === "red" && "text-red",
          tone === "white" && "text-white",
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          "text-xs lg:text-[11px]",
          tone === "white" ? "text-white/70" : "text-ink/70",
          tone === "red" && "max-lg:text-red",
        )}
      >
        <span className="lg:hidden">{label}</span>
        <span className="max-lg:hidden">Happenings</span>
      </span>
    </span>
  );
}
