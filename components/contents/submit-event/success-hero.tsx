import Link from "next/link";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import SurTitle from "@/components/common/sur-title";
// import ReviewSteps from "@/components/contents/submit-event/review-steps";
import Header from "@/components/header/header";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { DEFAULT_CITY_TIMEZONE, NAV } from "@/constants/nav";
import { cityDate, formatDay } from "@/lib/events/event-list";

// Figma: Submission Confirmation — Desktop / Mobile (341:3023, 341:3090).
export default function SuccessHero() {
  const today = formatDay(
    cityDate(new Date(), DEFAULT_CITY_TIMEZONE),
    "EEE dd MMM",
  );

  return (
    <div className="relative z-60 flex w-full flex-col bg-red text-white">
      <Header isLight />
      <SectionWrapper className="items-start gap-9">
        <SurTitle dot content={`Submitted · ${today}`} className="text-white" />
        <FadeUpText
          as="h1"
          text="We’ve got it!"
          delay={0.1}
          className="font-montreal text-7xl font-medium tracking-mono uppercase sm:text-9xl xl:text-[200px]"
        />
        <FadeUpText
          text="Your Happening has been submitted for review."
          delay={0.25}
          className="font-montreal text-3xl font-medium tracking-mono sm:text-5xl"
        />

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {/* <Button
            type="button"
            variant="onWhite"
            size="md"
            className="w-full sm:w-fit"
          >
            <HoverText text="View my happenings" />
          </Button> */}
          <Link href={NAV[0].link} className="w-full mt-8 sm:w-fit">
            <Button variant="outlineWhite" size="md" className="w-full">
              <HoverText text="Back to calendar" />
            </Button>
          </Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
