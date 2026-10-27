import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import EventDateMark from "@/components/contents/events/event-date-mark";
import EventDetailFacts from "@/components/contents/events/event-detail-facts";
import Header from "@/components/header/header";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { industryLabel, timeRange } from "@/lib/events/event-details";
import { cityDate, formatDay } from "@/lib/events/event-list";
import type { PublicEvent } from "@/requests/helpers/types";

interface Props {
  event: PublicEvent;
  timezone: string;
}

// Figma: Private Event — Desktop (334:2521), header on ink.
export default function PrivateEventHeader({ event, timezone }: Props) {
  // A limited listing or held date shows no venue or host.
  const limited = !event.venue && !event.organiser;
  const date = cityDate(event.startAt, timezone);

  return (
    <div className="relative z-60 flex w-full flex-col bg-ink text-white">
      <Header isLight className="bg-ink" />
      <SectionWrapper className="gap-6 md:gap-8 lg:flex-row lg:items-start lg:gap-14 xl:gap-20">
        <div className="flex flex-col gap-5">
          <SurTitle
            content={`${event.city?.name} / ${industryLabel(event)}`}
            className="text-cream"
          />
          <div className="flex w-full items-center gap-4">
            <EventDateMark
              date={date}
              variant="filled"
              className="w-20 md:w-80"
            />
            <div className="flex flex-col font-courier tracking-cou text-cream uppercase md:hidden">
              <span>{formatDay(date, "MMM yyyy")}</span>
              <span>{timeRange(event, timezone)}</span>
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-6 md:gap-8 lg:pt-9">
          <div className="flex flex-col">
            <FadeUpText
              as="h1"
              text={event.title}
              className="font-montreal text-5xl font-medium tracking-mono wrap-break-word uppercase sm:text-7xl xl:text-8xl"
            />
          </div>
          <EventDetailFacts
            event={event}
            timezone={timezone}
            className="text-cream"
          />
          {event.organiser && (
            <p className="font-montreal text-lg text-cream">
              Hosted by {event.organiser.name}
            </p>
          )}
          <div className="flex w-full flex-col items-start gap-5 border border-cream px-6 pt-7 pb-8 sm:px-8">
            <p className="font-montreal text-lg sm:text-[22px]">
              Venue, guest list and details are visible to invited guests. Sign
              in with the email your invitation was sent to.
            </p>
            {/* Sign-in for invited guests is not built yet. */}
            <Button variant="onWhite">Sign in to view</Button>
          </div>
          {limited && (
            <p className="font-courier text-[15px] text-cream/70">
              Listed so the city knows it is happening. Nothing else is shown.
            </p>
          )}
        </div>
      </SectionWrapper>
    </div>
  );
}
