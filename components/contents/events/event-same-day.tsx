import Link from "next/link";

import HoverText from "@/components/animations/hover-text";
import EventListCard from "@/components/contents/events/event-list-card";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import DateCircle from "@/components/ui/date-circle";
import { dayPath, formatDay } from "@/lib/events/event-list";
import { dateTense } from "@/lib/events/event-tense";
import type { PublicEvent } from "@/requests/helpers/types";

interface Props {
  city: { slug: string; name: string };
  timezone: string;
  date: string;
  /** The city's today, so the heading reads in the right tense. */
  today: string;
  events: PublicEvent[];
}

export default function EventSameDay({
  city,
  timezone,
  date,
  today,
  events,
}: Props) {
  if (!events.length) return null;
  const weekday = formatDay(date, "EEEE");
  const copy = {
    past: { heading: `Also that ${weekday}`, link: "Look back at the day" },
    today: { heading: "Also happening today", link: "See today" },
    future: { heading: `Also happening on ${weekday}`, link: "See the day" },
  }[dateTense(date, today)];
  return (
    <section
      aria-labelledby="same-day-heading"
      className="w-full bg-white text-ink"
    >
      <SectionWrapper>
        <div className="flex items-center justify-between gap-2 border-b border-ink pb-4.5 sm:gap-x-4">
          <div className="flex items-center gap-2">
            <DateCircle variant="filled" size="sm" className="max-sm:text-base">
              {formatDay(date, "dd")}
            </DateCircle>
            <h2
              id="same-day-heading"
              className="flex-1 font-montreal text-2xl font-medium tracking-mono md:text-3xl"
            >
              {copy.heading}
            </h2>
          </div>
          <Link className="max-md:hidden" href={dayPath(city.slug, date)}>
            <Button variant="flat" size="fit" className="text-red">
              <HoverText text={copy.link} />
            </Button>
          </Link>
        </div>
        {events.map((event) => (
          <EventListCard
            key={event.id}
            event={event}
            city={city.slug}
            timezone={timezone}
            date={date}
          />
        ))}
      </SectionWrapper>
    </section>
  );
}
