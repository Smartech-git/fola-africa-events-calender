"use client";

import { Suspense, useState, type FocusEvent, type PointerEvent } from "react";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import MarqueeText from "@/components/animations/marquee-text";
import ScrollVelocity from "@/components/animations/scroll-velocity";
import ExploreEvent from "@/components/contents/home/explore-event";
import HeroVideo from "@/components/contents/home/hero-video";
import HoverMedia from "@/components/contents/home/hover-media";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";

const heroMedia = [
  { id: "explore", src: "/assets/home/explore-event.mp4" },
  { id: "submit", src: "/assets/home/submit-event.mp4" },
];

export default function Hero() {
  const [hoveredMedia, setHoveredMedia] = useState<string | null>(null);
  const [focusedMedia, setFocusedMedia] = useState<string | null>(null);

  const mediaTrigger = (id: string) => ({
    onPointerEnter: (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse") setHoveredMedia(id);
    },
    onPointerLeave: () =>
      setHoveredMedia((current) => (current === id ? null : current)),
    onFocusCapture: (event: FocusEvent<HTMLDivElement>) => {
      if (event.target.matches(":focus-visible")) setFocusedMedia(id);
    },
    onBlurCapture: (event: FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget))
        setFocusedMedia(null);
    },
  });

  return (
    <div className="flex w-full flex-col">
      <SectionWrapper className="w-full py-4 sm:py-4">
        <div className="just flex w-full justify-between gap-4">
          <FadeUpText
            className="w-fit text-xxs uppercase sm:text-xs"
            text={`THE INDUSTRY CALENDAR FOR AFRICA’S KEY CITIES.`}
          />
          <FadeUpText
            delay={0.3}
            className="text-xxs w-fit uppercase max-sm:text-right sm:text-xs"
            text={`BROUGHT TO YOU BY FOLA LABS`}
          />
        </div>
      </SectionWrapper>
      <MarqueeText text="AFRICA’S EVENTS CALENDAR" />
      <SectionWrapper className="py-0 sm:py-0">
        <div className="flex w-full flex-col items-start justify-between sm:flex-row">
          <div className="relative flex w-full flex-col items-center gap-4 sm:w-fit sm:flex-row">
            <div className="w-full sm:w-fit" {...mediaTrigger("explore")}>
              <Suspense>
                <ExploreEvent />
              </Suspense>
            </div>
            <div className="w-full sm:w-fit" {...mediaTrigger("submit")}>
              <Button variant="link" size="sm" className="max-sm:w-full!">
                <HoverText
                  className="border-b border-inherit"
                  text="Submit an event"
                />
              </Button>
            </div>
            <HoverMedia
              items={heroMedia}
              activeId={hoveredMedia ?? focusedMedia}
              className="sm:ml-12 max-md:hidden"
            />
          </div>
          <FadeUpText
            delay={0.6}
            className="sm:text-right max-sm:my-4 sm:text-xs text-xxs uppercase sm:max-w-60"
            text={` SIX CITIES. TEN INDUSTRIES. ONE PLACE TO BE IN THE KNOW.`}
          />
        </div>
        <HeroVideo />
      </SectionWrapper>
      <div className="pt-12 pb-4">
        <ScrollVelocity
          texts={[
            "FASHION  ·  ART  ·  MUSIC  ·  DESIGN  ·  FILM & TELEVISION ",
            "TECHNOLOGY  ·  BUSINESS  ·  FOOD & DRINK  ·  BEAUTY  ·  SPORT",
          ]}
          velocity={100}
          className="text-3xl font-thin uppercase sm:text-4xl lg:text-5xl"
          numCopies={6}
          damping={50}
          stiffness={400}
        />
      </div>
    </div>
  );
}
