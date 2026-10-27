import { notFound } from "next/navigation";

import type { Metadata } from "next";

import EventAbout from "@/components/contents/events/event-about";
import EventArtwork from "@/components/contents/events/event-artwork";
import EventHeader from "@/components/contents/events/event-header";
import EventSameDay from "@/components/contents/events/event-same-day";
import PrivateEventHeader from "@/components/contents/events/private-event-header";
import PrivateEventListings from "@/components/contents/events/private-event-listings";
import SectionWrapper from "@/components/layout/section-wrapper";
import { SITE_NAME } from "@/constants/brand";
import { isPrivateEvent } from "@/lib/events/event-details";
import { cityDate, eventPath, formatDay } from "@/lib/events/event-list";
import { pageMetadata } from "@/lib/metadata";
import { getEvent } from "@/requests/events/get-event";
import { getEventList } from "@/requests/events/get-event-list";
import type { PublicEvent } from "@/requests/helpers/types";

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
      `${event.title} in ${event.city!.name} on ${formatDay(cityDate(event.startAt, event.city!.timezone), "d MMMM yyyy")}. View event details on ${SITE_NAME}.`,
    eventPath(event, city),
  );
}

async function sameDayEvents(event: PublicEvent, date: string) {
  try {
    const events = await getEventList({ city: event.city!.slug, date });
    return events.filter((item) => item.id !== event.id);
  } catch {
    return [];
  }
}

export default async function EventPage({ params }: Props) {
  const { city, event: slug } = await params;
  const event = await getEvent(slug, city);
  if (!event) notFound();
  const { timezone } = event.city!;

  if (isPrivateEvent(event))
    return (
      <div className="relative -mt-sm-header flex w-full flex-col bg-ink sm:-mt-header">
        <PrivateEventHeader event={event} timezone={timezone} />
        <PrivateEventListings event={event} timezone={timezone} />
      </div>
    );

  const date = cityDate(event.startAt, timezone);
  const others = await sameDayEvents(event, date);

  return (
    <div className="flex w-full flex-col bg-white">
      <EventHeader event={event} timezone={timezone} />
      <SectionWrapper className="gap-10 bg-white lg:flex-row lg:items-start lg:gap-14 xl:gap-20">
        <EventArtwork className="max-w-130 lg:w-[38%]" />
        <EventAbout event={event} timezone={timezone} />
      </SectionWrapper>
      <EventSameDay
        city={event.city!}
        timezone={timezone}
        date={date}
        events={others}
      />
    </div>
  );
}
