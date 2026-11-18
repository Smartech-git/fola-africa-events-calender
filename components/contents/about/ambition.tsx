import Link from "next/link";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import SurTitle from "@/components/common/sur-title";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { SITE_NAME } from "@/constants/brand";
import { DEFAULT_CITY_SLUG } from "@/constants/nav";
import { cn } from "@/lib/utils";

// The three words, stepping across the page like the continent's calendar.
const MORE = [
  { word: "Visible", align: "self-start" },
  { word: "Connected", align: "self-center" },
  { word: "Accessible", align: "self-end text-end" },
];

export default function Ambition() {
  return (
    <section
      aria-labelledby="about-ambition"
      className="w-full overflow-hidden bg-red text-white"
    >
      <SectionWrapper className="gap-12 sm:gap-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-40">
          <SurTitle
            as="h2"
            id="about-ambition"
            dot
            content="The ambition"
            className="text-white lg:w-75 lg:shrink-0"
          />
          <FadeUpText
            text={`${SITE_NAME} has a wider ambition: to make the continent’s activity more`}
            className="min-w-0 flex-1 font-montreal text-3xl font-medium tracking-mono sm:text-5xl"
          />
        </div>

        <ul className="flex flex-col gap-2 sm:gap-0">
          {MORE.map(({ word, align }, index) => (
            <li key={word} className={cn("flex flex-col", align)}>
              <span className="font-courier text-xs tracking-cou text-cream uppercase sm:text-sm">
                {String(index + 1).padStart(2, "0")}
              </span>
              <FadeUpText
                text={word}
                delay={index * 0.12}
                className="font-montreal text-6xl font-medium tracking-mono uppercase sm:text-8xl xl:text-9xl"
              />
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-8 border-t border-white/40 pt-10 lg:flex-row lg:items-end lg:justify-between">
          <FadeUpText
            text="Creating more opportunities for people, businesses and communities to engage and build together."
            className="max-w-190 font-montreal text-2xl sm:text-3xl"
          />
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href={`/calendar/${DEFAULT_CITY_SLUG}`}
              className="w-full sm:w-fit"
            >
              <Button variant="onWhite" size="md" className="w-full">
                <HoverText text="Explore the calendar" />
              </Button>
            </Link>
            <Link href="/cities" className="w-full sm:w-fit">
              <Button variant="outlineWhite" size="md" className="w-full">
                <HoverText text="See the cities" />
              </Button>
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </section>
  );
}
