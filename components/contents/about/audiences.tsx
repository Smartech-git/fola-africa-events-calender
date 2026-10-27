import FadeUpText from "@/components/animations/fade-up-text";
import SectionWrapper from "@/components/layout/section-wrapper";

const display =
  "font-montreal text-5xl font-medium tracking-mono uppercase sm:text-6xl xl:text-7xl";

export default function Audiences() {
  return (
    <section
      aria-label="Who Happenings is for"
      className="relative w-full overflow-hidden bg-ink"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 size-[70vw] -translate-x-1/2 translate-y-1/2 rounded-full border border-red md:border-2 lg:size-[44vw]"
      />
      <SectionWrapper className="gap-12">
        <FadeUpText
          text="The public sees what it can attend."
          className={`${display} md:max-w-[70%] text-white`}
        />
        <FadeUpText
          text="The industry sees what it needs to plan around."
          delay={0.15}
          className={`${display} md:max-w-[70%] self-end text-end text-cream`}
        />
      </SectionWrapper>
    </section>
  );
}
