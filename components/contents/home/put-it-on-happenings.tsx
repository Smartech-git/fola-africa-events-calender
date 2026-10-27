import Link from "next/link";

import DotField from "@/components/animations/dot-field";
import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";

export default function PutItOnHappenings() {
  return (
    <section
      aria-labelledby="put-it-on-heading"
      className="relative w-full overflow-hidden bg-red text-white"
    >
      <SectionWrapper className="relative z-10 items-start gap-8">
        <FadeUpText
          as="h2"
          id="put-it-on-heading"
          text="Put it on Happenings."
          className="font-montreal text-5xl font-medium tracking-mono uppercase sm:text-6xl xl:text-7xl"
        />
        <FadeUpText
          text="Planning something? Tell us what’s happening. Every submission is reviewed before it appears on the calendar."
          delay={0.15}
          className="max-w-150 font-montreal text-lg text-cream sm:text-2xl"
        />
        <Link href="/submit-event" className="w-full pt-2 sm:w-fit">
          <Button variant="onWhite" size="md" className="w-full">
            <HoverText text="Submit a happening" />
          </Button>
        </Link>
        <div className="h-40 w-full lg:hidden">
          <DotField />
        </div>
      </SectionWrapper>
      <div className="pointer-events-none absolute right-pg bottom-12 h-[15.5vw] w-[31vw] max-lg:hidden 2xl:right-pg-2xl">
        <DotField />
      </div>
    </section>
  );
}
