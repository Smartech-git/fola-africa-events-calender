import Link from "next/link";

import DotField from "@/components/animations/dot-field";
import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import SurTitle from "@/components/common/sur-title";
import Header from "@/components/header/header";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { ACCESS_OPTIONS } from "@/payload/constants";

export default function LandingHero() {
  return (
    <div className="relative z-60 flex w-full flex-col bg-red text-white">
      <Header isLight />
      <SectionWrapper className="gap-9">
        <SurTitle dot content="Submit a happening" className="text-white" />
        <FadeUpText
          as="h1"
          text="Put it on Happenings."
          delay={0.1}
          className="font-montreal text-6xl font-medium tracking-mono uppercase sm:text-8xl xl:text-[168px]"
        />

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-20">
          <div className="flex flex-col gap-1 font-montreal text-3xl font-medium tracking-mono sm:text-5xl lg:w-130 lg:shrink-0">
            <FadeUpText text="Planning something?" delay={0.2} />
            <FadeUpText
              text="Tell us what’s happening."
              delay={0.3}
              className="text-cream"
            />
          </div>

          <div className="flex flex-1 flex-col gap-5">
            <FadeUpText
              text="From summits, conferences and launches to exhibitions, screenings, shows, dinners, concerts and private gatherings, submit your event for consideration on Happenings of Africa."
              delay={0.3}
              className="font-montreal text-lg sm:text-2xl"
            />
            <p className="font-courier text-sm tracking-cou uppercase">
              Public, ticketed, RSVP, invitation only or private.
            </p>
            <ul aria-label="Access types" className="flex flex-wrap gap-2">
              {ACCESS_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  className="rounded-full"
                  variant="outlineWhite"
                >
                  {option.label}
                </Button>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-4 pt-3 sm:flex-row sm:items-center">
              <Link href="/submit-event/form" className="w-full sm:w-fit">
                <Button variant="onWhite" size="md" className="w-full">
                  <HoverText text="Get started" />
                </Button>
              </Link>
              <p className="font-montreal text-base text-cream">
                Every submission is reviewed before appearing on the calendar.
              </p>
            </div>
          </div>
        </div>

        <div className="h-16 w-full">
          <DotField />
        </div>
      </SectionWrapper>
    </div>
  );
}
