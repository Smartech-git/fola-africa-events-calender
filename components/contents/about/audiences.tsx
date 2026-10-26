import FadeUpText from "@/components/animations/fade-up-text";
import SectionWrapper from "@/components/layout/section-wrapper";

const display =
  "font-montreal text-4xl font-medium tracking-mono uppercase sm:text-6xl xl:text-[88px]";

export default function Audiences() {
  return (
    <section aria-label="Who Happenings is for" className="w-full bg-ink">
      <SectionWrapper className="gap-6">
        <FadeUpText
          text="The public sees what it can attend."
          className={`${display} text-white`}
        />
        <FadeUpText
          text="The industry sees what it needs to plan around."
          delay={0.15}
          className={`${display} text-cream`}
        />
      </SectionWrapper>
    </section>
  );
}
