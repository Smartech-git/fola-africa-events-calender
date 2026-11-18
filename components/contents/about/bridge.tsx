import FadeUpText from "@/components/animations/fade-up-text";
import SectionWrapper from "@/components/layout/section-wrapper";
import { SITE_NAME } from "@/constants/brand";

export default function Bridge() {
  return (
    <section aria-label="Why we exist" className="w-full bg-red text-white">
      <SectionWrapper className="gap-8">
        <FadeUpText
          text={`${SITE_NAME} exists to bridge that gap`}
          className="max-w-350 font-montreal text-5xl font-medium tracking-mono uppercase sm:text-6xl xl:text-8xl"
        />
      </SectionWrapper>
    </section>
  );
}
