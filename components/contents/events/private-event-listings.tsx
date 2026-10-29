import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import SectionWrapper from "@/components/layout/section-wrapper";
import {
  accessLabel,
  categoryLabel,
  industryLabel,
  timeRange,
} from "@/lib/events/event-details";
import { cityDate, formatDay } from "@/lib/events/event-list";
import { INDUSTRIES, VISIBILITY_OPTIONS } from "@/payload/constants";
import type { PublicEvent } from "@/requests/helpers/types";

interface Props {
  event: PublicEvent;
  timezone: string;
}

// Figma: Private Event — Desktop, "What should Happenings show?" (334:2556).
// Each card previews this happening as that listing would show it.
export default function PrivateEventListings({ event, timezone }: Props) {
  const date = formatDay(cityDate(event.startAt, timezone), "EEE dd MMM");
  const time = timeRange(event, timezone, false);
  const industry = industryLabel(event);
  const held = INDUSTRIES.find((item) => item.value === event.industry);
  const venue = [event.venue?.name, event.venue?.area]
    .filter(Boolean)
    .join(", ");

  const previews: Record<string, { title: string; lines: string[] }> = {
    public: {
      title: event.title,
      lines: [
        time,
        categoryLabel(event),
        accessLabel(event),
        venue,
        event.organiser ? `Hosted by ${event.organiser.name}` : "",
      ],
    },
    industry: {
      title: event.title,
      lines: [time, industry, accessLabel(event)],
    },
    "held-date": {
      title: `Private ${held?.short ?? held?.label ?? industry} event`,
      lines: [time, industry, "Private"],
    },
  };

  return (
    <section
      aria-labelledby="listing-modes-heading"
      className="w-full border-t border-white/20 bg-ink text-white"
    >
      <SectionWrapper className="gap-8">
        <SurTitle
          content="What should Happenings show?"
          className="text-cream"
        />
        <FadeUpText
          as="h2"
          id="listing-modes-heading"
          text="Organisers decide how a private happening appears"
          className="font-montreal text-3xl font-medium tracking-mono sm:text-5xl"
        />
        <ul className="grid gap-6 md:grid-cols-3">
          {VISIBILITY_OPTIONS.map((option) => {
            const preview = previews[option.value];
            return (
              <li
                key={option.value}
                className="flex flex-col gap-3.5 bg-cream px-6 pt-6 pb-7 text-ink"
              >
                <SurTitle as="h3" content={option.label} />
                <p className="font-montreal text-base">{option.description}</p>
                <div className="flex flex-col gap-1 border-t border-ink/30 pt-4">
                  <p className="font-courier text-sm tracking-cou text-red uppercase">
                    {date}
                  </p>
                  <p className="font-montreal text-xl font-medium tracking-mono uppercase">
                    {preview.title}
                  </p>
                  {preview.lines.filter(Boolean).map((line) => (
                    <p key={line} className="font-courier text-[15px]">
                      {line}
                    </p>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </SectionWrapper>
    </section>
  );
}
