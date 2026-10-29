import DotField from "@/components/animations/dot-field";
import FadeUpText from "@/components/animations/fade-up-text";
import Header from "@/components/header/header";
import SectionWrapper from "@/components/layout/section-wrapper";
import type { EventsHeader as EventsHeaderData } from "@/requests/events/get-events-header";

interface Props {
  data: EventsHeaderData;
}

export default function EventsHeader({ data: { city } }: Props) {
  return (
    <div className="relative z-60 flex w-full flex-col overflow-hidden bg-cream text-ink">
      <Header className="bg-cream" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24.5 md:right-[70%] max-md:left-[65%] size-[70vw] rounded-full border border-red md:top-28.5 md:size-[36vw]"
      />
      <div className="pointer-events-none absolute right-pg-sm bottom-10 lg:h-40 h-28 w-[30vw] max-md:hidden sm:right-pg lg:w-[26vw] 2xl:right-pg-2xl 4k:right-pg-4k">
        <DotField color="#B51C17" restOpacity={0.18} />
      </div>
      <SectionWrapper className="relative gap-2">
        <div className="flex gap-4 sm:gap-6">
          <span
            aria-hidden="true"
            className="size-6 shrink-0 rounded-full bg-red md:size-12"
          />
          <div className="flex gap-2 flex-col">

          <FadeUpText
            as="h1"
            text={city.name}
            className="min-w-0 font-montreal text-5xl leading-none font-medium tracking-mono wrap-break-word text-red uppercase lg:text-7xl xl:text-8xl"
          />
          <FadeUpText
          text={`What’s happening in ${city.name}?`}
          delay={0.1}
          className="font-montreal text-xl font-medium w-fit tracking-mono sm:text-3xl lg:text-4xl"
        />
        </div>
        </div>
        
      </SectionWrapper>
    </div>
  );
}
