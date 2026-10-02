import Link from "next/link";

import { ArrowRight, Dot } from "lucide-react";

import Fade from "@/components/animations/fade";
import HoverText from "@/components/animations/hover-text";
import HeaderTitle from "@/components/common/header-title";
import LabelTitle from "@/components/common/label-title";
import SectionWrapper from "@/components/layout/section-wrapper";
import LenisProvider from "@/components/providers/lenis-provider";
import Button from "@/components/ui/button";
import { formatSeasonDates } from "@/lib/events/season-dates";
import type { EventsHeader as EventsHeaderData } from "@/requests/events/get-events-header";

interface Props {
  data: EventsHeaderData;
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
                  <Link
                    href={`/seasons/${encodeURIComponent(season.slug)}`}
                    data-hover-text
                    className="group relative flex h-full min-h-28 w-75 cursor-pointer flex-col justify-between border border-light-gray p-4 focus-visible:outline-2 focus-visible:outline-primary"
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
                  </Link>
                </Fade>
              );
            })}
          </LenisProvider>
        </div>
      )}
    </SectionWrapper>
  );
}
