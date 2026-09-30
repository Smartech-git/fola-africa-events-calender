import Link from "next/link";

import {
  format,
  isSameDay,
  isSameMonth,
  isSameYear,
  isValid,
  parseISO,
} from "date-fns";
import { ArrowRight, Dot } from "lucide-react";

import Fade from "@/components/animations/fade";
import HoverText from "@/components/animations/hover-text";
import HeaderTitle from "@/components/common/header-title";
import LabelTitle from "@/components/common/label-title";
import SectionWrapper from "@/components/layout/section-wrapper";
import LenisProvider from "@/components/providers/lenis-provider";
import Button from "@/components/ui/button";
import type {
  EventsHeader as EventsHeaderData,
  SeasonSummary,
} from "@/requests/events/get-events-header";

interface Props {
  data: EventsHeaderData;
}

function formatSeasonDates(season: SeasonSummary, timezone: string) {
  if (!season.startDate || !season.endDate) return null;
  const startInstant = parseISO(season.startDate);
  const endInstant = parseISO(season.endDate);
  if (!isValid(startInstant) || !isValid(endInstant)) return null;

  // Format the city's calendar dates regardless of the server's timezone.
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const localDate = (instant: Date) => {
    const parts = formatter.formatToParts(instant);
    const part = (type: string) =>
      parts.find((entry) => entry.type === type)!.value;
    return parseISO(part("year") + "-" + part("month") + "-" + part("day"));
  };
  const start = localDate(startInstant);
  const end = localDate(endInstant);
  if (isSameDay(start, end)) return format(start, "dd MMM");
  if (isSameMonth(start, end))
    return format(start, "dd") + "\u2013" + format(end, "dd MMM");
  if (isSameYear(start, end))
    return format(start, "dd MMM") + "\u2013" + format(end, "dd MMM");
  return format(start, "dd MMM yyyy") + "\u2013" + format(end, "dd MMM yyyy");
}

export default function EventsHeader({ data: { city, seasons } }: Props) {
  return (
    <SectionWrapper className="gap-6 pb-2 sm:pb-4">
      <div className="flex w-full justify-between gap-8">
        <div className="flex w-full flex-col">
          <HeaderTitle text={city.name} />
          <span className="text-xs uppercase">
            Time in {city.timezoneLabel || city.timezone}
          </span>
        </div>
        <Link className="mt-1 w-fit" href={`/submit-event`}>
          <Button size="fit" variant="link">
            <HoverText text="Submit event" />
          </Button>
        </Link>
      </div>
      {seasons.length > 0 && (
        <div className="flex flex-col gap-2">
          <LabelTitle title="Upcoming seasons" />
          <LenisProvider
            orientation="horizontal"
            className="h-fit overflow-x-auto overflow-y-hidden *:flex *:min-h-0 *:w-max *:gap-2"
          >
            {seasons.map((season, idx) => {
              const dates = formatSeasonDates(season, city.timezone);
              return (
                <Fade
                  delay={idx < 6 ? idx * 0.2 : 0}
                  key={season.id}
                  translateX={12}
                  translateY={0}
                  amount={0.0}
                  once
                >
                  <div
                    data-hover-text
                    className="group relative flex h-full min-h-28 w-75 cursor-pointer flex-col justify-between border border-light-gray p-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center">
                        <HoverText
                          className="text-xs font-medium uppercase"
                          text={season.name}
                        />
                        {dates && (
                          <>
                            <Dot size={24} className="text-primary" />
                            <span className="text-xs whitespace-nowrap uppercase">
                              {dates}
                            </span>
                          </>
                        )}
                      </div>
                      {season.description && (
                        <HoverText
                          className="mt-1 line-clamp-2 w-full text-xxs uppercase"
                          text={season.description}
                        />
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-4">
                      <div className="bg-secondary px-1 py-0.5 text-xxs uppercase">
                        {season.status === "final" ? "Final" : "Provisional"}
                      </div>
                      <ArrowRight
                        size={12}
                        className="transition-all group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </Fade>
              );
            })}
          </LenisProvider>
        </div>
      )}
    </SectionWrapper>
  );
}
