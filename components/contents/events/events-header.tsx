import DotField from "@/components/animations/dot-field";
import FadeUpText from "@/components/animations/fade-up-text";
import CitySwitcher from "@/components/contents/events/city-switcher";
import Header from "@/components/header/header";
import SectionWrapper from "@/components/layout/section-wrapper";
import type { EventsHeader as EventsHeaderData } from "@/requests/events/get-events-header";
import type { CitySummary } from "@/requests/get-cities";

interface Props {
  data: EventsHeaderData;
  cities: CitySummary[];
  /** The slug from the route. */
  citySlug: string;
}

export default function EventsHeader({
  data: { city },
  cities,
  citySlug,
}: Props) {
  return (
    <div className="relative z-60 flex w-full flex-col overflow-hidden bg-cream text-ink">
      <Header className="bg-cream" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24.5 size-[70vw] rounded-full border border-red max-md:left-[65%] md:top-20.5 md:right-[70%] md:size-[36vw]"
      />
      <div className="pointer-events-none absolute right-pg-sm bottom-10 h-28 w-[30vw] max-md:hidden sm:right-pg lg:h-40 lg:w-[26vw] 2xl:right-pg-2xl 4k:right-pg-4k">
        <DotField color="#B51C17" restOpacity={0.18} />
      </div>
      <SectionWrapper className="relative gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 gap-2 sm:gap-6">
          <span
            aria-hidden="true"
            className="mt-3 size-4 shrink-0 rounded-full bg-red md:mt-4 md:size-8"
          />
          <div className="flex flex-col">
            {/* <FadeUpText
              text={`Happenings in`}
              delay={0.1}
              className="w-fit font-montreal text-sm font-medium tracking-mono sm:text-base lg:text-xl"
            /> */}
            <FadeUpText
              as="h1"
              text={city.name}
              className="min-w-0 font-montreal text-5xl leading-none font-medium tracking-mono wrap-break-word text-red uppercase md:text-6xl lg:text-7xl xl:text-[110px]"
            />
          </div>
        </div>
        <CitySwitcher cities={cities} value={citySlug} className="shrink-0" />
      </SectionWrapper>
    </div>
  );
}
