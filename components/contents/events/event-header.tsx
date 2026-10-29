import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import { EventDetailActions } from "@/components/contents/events/event-actions";
import EventDateMark from "@/components/contents/events/event-date-mark";
import EventDetailFacts from "@/components/contents/events/event-detail-facts";
import SectionWrapper from "@/components/layout/section-wrapper";
import { industryLabel, timeRange } from "@/lib/events/event-details";
import { cityDate, formatDay } from "@/lib/events/event-list";
import type { PublicEvent } from "@/requests/helpers/types";

interface Props {
  event: PublicEvent;
  timezone: string;
}

export default function EventHeader({ event, timezone }: Props) {
  return (
    <section aria-labelledby="event-title" className="w-full bg-cream text-ink">
      <SectionWrapper className="gap-6 md:gap-8 lg:flex-row lg:items-start lg:gap-14 xl:gap-20">
        <div className="flex flex-col gap-5">
          <SurTitle content={`${event.city?.name} / ${industryLabel(event)}`} />
          <div className="flex w-full items-center gap-4">
            <EventDateMark
              date={cityDate(event.startAt, timezone)}
              className="w-20 md:w-80"
            />
            <div className="flex flex-col font-courier tracking-cou uppercase md:hidden">
              <span className="">{formatDay(event.startAt, "MMM yyyy")}</span>
              <span className="text">{timeRange(event, timezone)}</span>
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-6 md:gap-8 lg:pt-9">
          <div className="flex flex-col">
            <FadeUpText
              as="h1"
              id="event-title"
              text={event.title}
              className="font-montreal text-5xl font-medium tracking-mono wrap-break-word uppercase md:text-7xl"
            />
          </div>
          <EventDetailFacts event={event} timezone={timezone} />
          <EventDetailActions event={event} timezone={timezone} />
        </div>
      </SectionWrapper>
    </section>
  );
}
