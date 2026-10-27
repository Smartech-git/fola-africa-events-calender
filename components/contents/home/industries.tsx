"use client";

import { Fragment, useRef } from "react";

import Link from "next/link";

import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";

import SurTitle from "@/components/common/sur-title";
import SectionWrapper from "@/components/layout/section-wrapper";
import { FILTER_KEYS } from "@/constants/filters";
import { DEFAULT_CITY_SLUG } from "@/constants/nav";
import { INDUSTRIES } from "@/payload/constants";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
/** Seconds between each word or circle entering. */
const STEP = 0.045;

// Each word rises out of its own mask, like FadeUpText's lines.
const word: Variants = {
  hidden: { y: "105%", opacity: 0 },
  show: (order: number) => ({
    y: "0%",
    opacity: 1,
    transition: { duration: 0.9, delay: 0.15 + order * STEP, ease: EXPO_OUT },
  }),
};

// Circles simply appear, a beat after the word before them.
const circle: Variants = {
  hidden: { opacity: 0 },
  show: (order: number) => ({
    opacity: 1,
    transition: { duration: 0.4, delay: 0.3 + order * STEP, ease: "easeOut" },
  }),
};

// Figma: Home, Category signal (327:1957 desktop, 329:1941 mobile).
export default function Industries() {
  const textRef = useRef<HTMLParagraphElement>(null);
  const inView = useInView(textRef, { amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const state = reduceMotion || inView ? "show" : "hidden";

  let order = 0;

  return (
    <section
      aria-labelledby="industries-heading"
      className="w-full bg-cream text-ink"
    >
      <SectionWrapper className="gap-6 sm:gap-9">
        <SurTitle
          id="industries-heading"
          content="One calendar · Ten industries"
        />
        <motion.p
          ref={textRef}
          initial={reduceMotion ? false : "hidden"}
          animate={state}
          className="font-montreal text-4xl font-medium tracking-mono uppercase sm:text-6xl lg:text-7xl"
        >
          {INDUSTRIES.map((industry, index) => (
            <Fragment key={industry.value}>
              {index > 0 && (
                <>
                  {" "}
                  <motion.span
                    aria-hidden="true"
                    custom={order++}
                    variants={circle}
                    className="inline-block size-[0.6em] rounded-full bg-red align-middle"
                  />{" "}
                </>
              )}
              <Link
                href={`/calendar/${DEFAULT_CITY_SLUG}?${new URLSearchParams({
                  [FILTER_KEYS.industry]: industry.value,
                })}`}
                aria-label={`See ${industry.label} happenings`}
                className="transition-colors hover:text-red focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red"
              >
                {industry.label.split(" ").map((part, partIndex) => (
                  <Fragment key={partIndex}>
                    {partIndex > 0 && " "}
                    <span className="inline-block overflow-hidden align-middle">
                      <motion.span
                        custom={order++}
                        variants={word}
                        className="inline-block"
                      >
                        {part}
                      </motion.span>
                    </span>
                  </Fragment>
                ))}
              </Link>
            </Fragment>
          ))}
        </motion.p>
      </SectionWrapper>
    </section>
  );
}
