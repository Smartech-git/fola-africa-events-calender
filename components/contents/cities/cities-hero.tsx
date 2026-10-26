import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import Header from "@/components/header/header";
import SectionWrapper from "@/components/layout/section-wrapper";
import { DEFAULT_CITY_TIMEZONE } from "@/constants/nav";
import { cityDate, formatDay } from "@/lib/events/event-list";

export default function CitiesHero() {
  const today = formatDay(
    cityDate(new Date(), DEFAULT_CITY_TIMEZONE),
    "EEE dd MMM",
  );

  return (
    <div className="relative z-60 flex w-full flex-col bg-cream text-ink">
      <Header className="bg-cream" />
      <section aria-labelledby="cities-heading">
        <SectionWrapper className="gap-4">
          <SurTitle dot content={`Cities · ${today}`} />
          <FadeUpText
            as="h1"
            id="cities-heading"
            text="What’s happening?"
            delay={0.1}
            className="font-montreal text-5xl font-medium tracking-mono text-red uppercase sm:text-6xl lg:text-8xl xl:text-[120px]"
          />
          <FadeUpText
            text="Choose a city."
            delay={0.2}
            className="font-montreal text-xl font-medium tracking-mono sm:text-[32px]"
          />
        </SectionWrapper>
      </section>
    </div>
  );
}
