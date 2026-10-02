import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft, Check } from "lucide-react";
import type { Metadata } from "next";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import LabelTitle from "@/components/common/label-title";
import {
  EventAttendanceAction,
  EventCalendarActions,
  EventExternalAction,
} from "@/components/contents/events/event-actions";
import EventFacts from "@/components/contents/events/event-facts";
import EventLocation from "@/components/contents/events/event-location";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import {
  cityDate,
  eventPath,
  formatDay,
} from "@/lib/events/event-list";
import { pageMetadata } from "@/lib/metadata";
import { getEvent } from "@/requests/events/get-event";

interface Props {
  params: Promise<{ city: string; event: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, event: slug } = await params;
  const event = await getEvent(slug, city);
  if (!event) notFound();
  return pageMetadata(
    `${event.title} in ${event.city!.name}`,
    event.description ||
      `${event.title} in ${event.city!.name} on ${formatDay(cityDate(event.startAt, event.city!.timezone), "d MMMM yyyy")}. View event details on FOLA.`,
    eventPath(event, city),
  );
}

export default async function EventPage({ params }: Props) {
  const { city, event: slug } = await params;
  const event = await getEvent(slug, city);
  if (!event) notFound();
  const { timezone} = event.city!;
  const date = cityDate(event.startAt, timezone);

  return (
    <SectionWrapper>
        <div className="">
          <Link href={`/events/${encodeURIComponent(city)}`}>
            <Button
              startContent={<ArrowLeft size={12} />}
              variant="flat"
              size="fit"
            >
              <HoverText text="Back to events" />
            </Button>
          </Link>
          <div className="mt-8 space-y-4">
            <p className="text-xl font-light uppercase sm:text-3xl lg:text-5xl">
              <time dateTime={date}>{formatDay(date, "dd MMMM")}</time>
            </p>
            <FadeUpText
              as="h1"
              className="font-apris text-4xl text-primary uppercase sm:text-6xl lg:text-7xl"
              text={event.title}
            />
            <div className="space-y-2 text-xs uppercase sm:text-sm">
              <EventFacts event={event} timezone={timezone} showTimezone />

              <div className="flex flex-wrap items-center gap-2">
                {event.venue && <p>{event.venue.name}</p>}
                {event.verified && (
                  <p className="flex w-fit items-center gap-1 bg-secondary px-2 py-0.5 text-xxs sm:text-xs">
                    <Check size={12} className="text-inherit" /> Verified by
                    organiser
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-x-8 gap-y-4 pt-4 sm:flex-row sm:items-center">
              <EventAttendanceAction event={event} prominent />
              <EventCalendarActions event={event} timezone={timezone} />
            </div>
          </div>
        </div>
        <div className="mt-8 space-y-8 border-t border-light-gray py-8">
          {event.description && (
            <FadeUpText
              as="p"
              className="w-full text-xs uppercase sm:text-sm"
              text={event.description}
            />
          )}
          {event.organiser && (
            <section aria-labelledby="event-organiser" className="space-y-4">
              <LabelTitle title="Organiser" />
              <p className="text-xs uppercase sm:text-xs">
                {event.organiser.name}
              </p>
              <EventExternalAction
                url={event.organiser.website}
                label="Organiser website"
              />
            </section>
          )}
          <EventLocation event={event} />
          {event.seasons.length > 0 && (
            <section
              aria-labelledby="event-seasons"
              className="space-y-4 border-t border-light-gray pt-8"
            >
              <LabelTitle title=" Part of" />

              <ul className="flex flex-wrap gap-6 text-sm uppercase">
                {event.seasons.map((season) => (
                  <li key={season.slug}>{season.name}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </SectionWrapper>
  );
}
