import Link from "next/link";

import HoverText from "@/components/animations/hover-text";
import EventListCard from "@/components/contents/events/event-list-card";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import DateCircle from "@/components/ui/date-circle";
import { dayPath, formatDay } from "@/lib/events/event-list";
import type { PublicEvent } from "@/requests/helpers/types";

interface Props {
  city: { slug: string; name: string };
  timezone: string;
  date: string;
  events: PublicEvent[];
}

export default function EventSameDay({ city, timezone, date, events }: Props) {
  if (!events.length) return null;
  return (
    <section
      aria-labelledby="same-day-heading"
      className="w-full bg-white text-ink"
    >
      <SectionWrapper>
        <div className="flex items-center gap-2 border-b border-ink pb-4.5 sm:gap-4">
          <DateCircle variant="filled" size="sm" className="max-sm:text-base">
            {formatDay(date, "dd")}
          </DateCircle>
          <h2
            id="same-day-heading"
            className="flex-1 font-montreal text-xl font-medium tracking-mono md:text-3xl"
          >
            Also happening on {formatDay(date, "EEEE")}
          </h2>
          <Link href={dayPath(city.slug, date)}>
            <Button variant="flat" size="fit" className="text-red">
              <HoverText text="See the day" />
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
