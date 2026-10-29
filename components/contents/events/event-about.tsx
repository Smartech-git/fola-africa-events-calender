import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import SurTitle from "@/components/common/sur-title";
import Button from "@/components/ui/button";
import DateCircle from "@/components/ui/date-circle";
import { displayDomain, venueMapUrl } from "@/lib/events/event-details";
import { cityDate, externalUrl, formatDay } from "@/lib/events/event-list";
import { formatSeasonDates } from "@/lib/events/season-dates";
import type { PublicEvent } from "@/requests/helpers/types";

interface Props {
  event: PublicEvent;
  timezone: string;
}

const block = "flex w-full flex-col gap-3 border-t border-ink/30 pt-6";
const outbound =
  "flex w-fit items-center gap-1.5 font-courier text-base transition-colors hover:text-red focus-visible:outline-2 focus-visible:outline-red sm:text-lg";

export default function EventAbout({ event, timezone }: Props) {
  const organiserSite = externalUrl(event.organiser?.website);
  const links = [
    { label: "Website", href: externalUrl(event.website) },
    { label: "Instagram", href: externalUrl(event.instagram) },
    { label: "Map", href: venueMapUrl(event) },
  ].filter((link): link is { label: string; href: string } =>
    Boolean(link.href),
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      {event.description && (
        <>
          <SurTitle as="h2" content="About this happening" />
          <FadeUpText
            text={event.description}
            className="font-montreal text-xl sm:text-2xl"
          />
        </>
      )}

      {event.organiser && (
        <section aria-labelledby="event-organiser" className={block}>
          <SurTitle as="h2" id="event-organiser" content="Organiser" />
          <p className="font-montreal text-xl tracking-mono sm:text-2xl">
            {event.organiser.name}
          </p>
          {organiserSite && (
            <Link
              href={organiserSite}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="fit"
                variant="flat"
                endContent={<ArrowUpRight size={16} aria-hidden="true" />}
              >
                <HoverText text={displayDomain(organiserSite) ?? ""} />
              </Button>
            </Link>
          )}
        </section>
      )}

      {(links.length > 0 || event.publicContactEmail) && (
        <section aria-labelledby="event-links" className={block}>
          <SurTitle as="h2" id="event-links" content="Links" />
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={outbound}
                >
                  <Button
                    size="fit"
                    variant="flat"
                    endContent={<ArrowUpRight size={16} aria-hidden="true" />}
                  >
                    <HoverText text={link.label} />
                  </Button>
                </Link>
              </li>
            ))}
            {event.publicContactEmail && (
              <li>
                <Link
                  href={`mailto:${event.publicContactEmail}`}
                  className={outbound}
                >
                  {event.publicContactEmail}
                </Link>
              </li>
            )}
          </ul>
        </section>
      )}

      {event.seasons.map((season) => {
        const dates = formatSeasonDates(season, timezone);
        return (
          <Link
            key={season.slug}
            href={`/seasons/${encodeURIComponent(season.slug)}`}
            className="group/season flex w-full items-center gap-4 border-t border-ink/30 pt-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
          >
            {season.startDate && (
              <DateCircle size="sm">
                {formatDay(cityDate(season.startDate, timezone), "dd")}
              </DateCircle>
            )}
            <span className="flex flex-col gap-0.5">
              <SurTitle content="In the diary" />
              <span className="font-montreal text-lg transition-colors group-hover/season:text-red">
                {[season.name, dates].filter(Boolean).join(" · ")}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
