import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import ReviewSteps from "@/components/contents/submit-event/review-steps";
import SectionWrapper from "@/components/layout/section-wrapper";

// Figma: Submit Landing, "How it works" (336:2786).
export default function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works"
      className="w-full bg-cream text-ink"
    >
      <SectionWrapper className="gap-8 sm:gap-10">
        <SurTitle as="h2" id="how-it-works" content="How it works" />
        <FadeUpText
          text="Nothing publishes automatically"
          className="font-montreal text-5xl font-medium tracking-mono sm:text-7xl"
        />
        <ReviewSteps done={1} />
      </SectionWrapper>
    </section>
  );
}
