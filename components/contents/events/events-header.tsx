import FadeUpText from "@/components/animations/fade-up-text";
import Header from "@/components/header/header";
import SectionWrapper from "@/components/layout/section-wrapper";
import type { EventsHeader as EventsHeaderData } from "@/requests/events/get-events-header";

interface Props {
  data: EventsHeaderData;
}

// Figma: City header (331:1957).
export default function EventsHeader({ data: { city } }: Props) {
  return (
    <div className="relative z-60 flex w-full flex-col overflow-hidden bg-cream text-ink">
      <Header className="bg-cream" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24.5 left-[70%] size-[70vw] rounded-full border border-red md:top-28.5 md:size-[36vw]"
      >
      </div>
      <SectionWrapper className="relative gap-2">
        <div className="flex items-center gap-4 sm:gap-6">
          <span
            aria-hidden="true"
            className="size-7 shrink-0 rounded-full bg-red sm:size-12"
          />
          <FadeUpText
            as="h1"
            text={city.name}
            className="min-w-0 font-montreal text-6xl leading-none font-medium tracking-mono wrap-break-word text-red uppercase md:text-9xl"
          />
        </div>
        <FadeUpText
          text={`What’s happening in ${city.name}?`}
          delay={0.1}
          className="font-montreal text-xl font-medium tracking-mono sm:text-3xl md:ml-[6%] lg:text-4xl"
        />
      </SectionWrapper>
    </div>
  );
}
