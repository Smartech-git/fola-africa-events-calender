import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import SectionWrapper from "@/components/layout/section-wrapper";

const BODY = [
  "Across business, finance, technology, fashion, art, music, design, film, food, beauty and sport, Happenings brings public, ticketed, invitation only and private events into one place.",
  "Built to make Africa’s creative and commercial calendar easier to see, connect and plan around.",
];

export default function Calendar() {
  return (
    <section
      aria-labelledby="about-calendar"
      className="w-full bg-cream text-ink"
    >
      <SectionWrapper className="gap-6 lg:flex-row lg:gap-40">
        <SurTitle
          as="h2"
          id="about-calendar"
          content="The calendar"
          className="lg:w-75 lg:shrink-0"
        />
        <div className="flex flex-1 flex-col gap-7">
          <FadeUpText
            text="Happenings of Africa is a shared calendar for the events shaping Africa’s cities."
            className="font-montreal text-2xl font-medium tracking-mono sm:text-4xl"
          />
          {BODY.map((paragraph, index) => (
            <FadeUpText
              key={index}
              text={paragraph}
              delay={0.1 + index * 0.1}
              className="font-montreal text-lg sm:text-xl"
            />
          ))}
        </div>
      </SectionWrapper>
    </section>
  );
}
