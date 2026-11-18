"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";

import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import SectionWrapper from "@/components/layout/section-wrapper";

const SOURCES = [
  { label: "Social media", x: "-14vw", y: "-7rem", rotate: -9 },
  { label: "Newsletters", x: "12vw", y: "-11rem", rotate: 7 },
  { label: "Ticketing platforms", x: "-9vw", y: "8rem", rotate: 5 },
  { label: "Personal networks", x: "16vw", y: "5rem", rotate: -6 },
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function Source({
  source,
  progress,
}: {
  source: (typeof SOURCES)[number];
  progress: MotionValue<number>;
}) {
  const x = useTransform(progress, [0, 1], [source.x, "0vw"]);
  const y = useTransform(progress, [0, 1], [source.y, "0rem"]);
  const rotate = useTransform(progress, [0, 1], [source.rotate, 0]);
  return (
    <motion.li
      style={{ x, y, rotate }}
      className=" text-white bg-red px-4 py-3 font-courier text-lg tracking-cou whitespace-nowrap uppercase sm:px-5 sm:text-lg"
    >
      {source.label}
    </motion.li>
  );
}

export default function TheGap() {
  const stage = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const scrolled = useMotionValue(0);
  // The page scrolls inside Lenis, not the window: 0 as the stage enters from
  // below, 1 once its centre reaches the middle of the screen.
  const measure = useCallback(() => {
    const element = stage.current;
    if (!element) return;
    const { top, height } = element.getBoundingClientRect();
    const view = window.innerHeight;
    scrolled.set(clamp((view - top) / (view / 2 + height / 2)));
  }, [scrolled]);
  useEffect(() => {
    measure();
    // Scroll events don't bubble; capture them from whichever element scrolls.
    const options = { capture: true, passive: true };
    window.addEventListener("scroll", measure, options);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, options);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);
  const still = useTransform(scrolled, () => 1);
  const progress = reduceMotion ? still : scrolled;
  const together = useTransform(progress, [0.85, 1], [0, 1]);

  return (
    <section
      aria-labelledby="about-gap"
      className="w-full overflow-hidden bg-white text-ink"
    >
      <SectionWrapper className="gap-10 lg:flex-row lg:gap-40">
        <SurTitle
          as="h2"
          id="about-gap"
          content="The gap"
          className="lg:w-75 lg:shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-7">
          <FadeUpText
            text="Yet, finding out what’s happening is not always easy"
            className="font-montreal text-3xl font-medium tracking-mono sm:text-5xl"
          />
          <FadeUpText
            text="Information is scattered across social media, newsletters, ticketing platforms and personal networks, making discovery fragmented and opportunities easy to miss."
            delay={0.1}
            className="max-w-190 font-montreal text-xl sm:text-2xl"
          />
        </div>
      </SectionWrapper>

      <div
        ref={stage}
        aria-hidden="true"
        className="flex min-h-80 flex-col items-center justify-center gap-6 px-pg-sm pb-14 sm:min-h-50 sm:px-pg"
      >
        <ul className="flex flex-wrap justify-center gap-2 sm:gap-8">
          {SOURCES.map((source) => (
            <Source key={source.label} source={source} progress={progress} />
          ))}
        </ul>
        <motion.span
          style={{ opacity: together }}
          className="font-courier text-xs tracking-cou text-red uppercase sm:text-sm"
        >
          One place
        </motion.span>
      </div>
    </section>
  );
}
