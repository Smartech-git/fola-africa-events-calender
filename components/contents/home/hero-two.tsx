"use client";

import type { ReactNode } from "react";

import Link from "next/link";

import { motion, useReducedMotion } from "framer-motion";

import DotField from "@/components/animations/dot-field";
import Fade from "@/components/animations/fade";
import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
// import Logo from "@/components/header/logo";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { DEFAULT_CITY_SLUG, NAV } from "@/constants/nav";
import { useCalendarToday } from "@/hooks/use-calendar-today";
import { dayPath, formatDay } from "@/lib/events/event-list";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

const label = "font-courier text-xs tracking-cou uppercase text-end sm:text-sm";

interface Props {
  header?: ReactNode;
}

export default function Hero({ header }: Props) {
  const { totalEvents, cityName, date } = useCalendarToday();
  const day = formatDay(date, "EEE dd MMM");
  const count =
    totalEvents === undefined
      ? undefined
      : `${totalEvents} ${totalEvents === 1 ? "happening" : "happenings"}`;

  return (
    <div className="relative z-60 flex max-h-300 w-full flex-col overflow-hidden bg-red text-white">
      {header}
      <section
        aria-labelledby="hero-heading"
        className="relative lg:min-h-[44.6vw]"
      >
        <SectionWrapper className="relative z-10 items-start gap-8 lg:max-w-[60vw]">
          <FadeUpText
            as="h1"
            id="hero-heading"
            text="Where Africa’s people, ideas and events meet"
            delay={0.15}
            className="font-montreal text-5xl leading-tight font-medium tracking-mono uppercase md:text-7xl 4k:text-8xl"
          />
          <FadeUpText
            text="One calendar for what is happening across Africa’s cities."
            delay={0.3}
            className="max-w-155 font-montreal text-lg text-cream sm:text-2xl"
          />

          <Link href={NAV[0].link} className="lg:mt-4 mt-12 w-full sm:w-fit">
            <Button variant="ink" size="md" className="w-full">
              <HoverText text="See what’s happening" />
            </Button>
          </Link>
        </SectionWrapper>

        <TodayMark
          day={day}
          key={count}
          digits={formatDay(date, "dd").split("")}
          caption={count ? `${count} in ${cityName}` : ""}
          href={dayPath(DEFAULT_CITY_SLUG, date)}
          label={`See today’s happenings in ${cityName}, ${day}`}
        />

        <div className="pointer-events-none absolute inset-x-pg bottom-12 hidden h-36 sm:h-36 lg:block 2xl:inset-x-pg-2xl 4k:inset-x-pg-4k">
          <DotField />
        </div>
      </section>
    </div>
  );
}

function TodayMark({
  day,
  digits,
  caption,
  href,
  label: linkLabel,
}: {
  day: string;
  digits: string[];
  caption: string;
  href: string;
  label: string;
}) {
  const reduceMotion = useReducedMotion();
  const circle =
    "absolute max-md:bottom-[-12.5vw] left-[30.5vw] size-[95vw] rounded-full border border-white lg:top-0 lg:left-[60.9vw] lg:size-[52.8vw]";

  return (
    <div className="pointer-events-none relative h-[70vw] lg:absolute lg:inset-0 lg:h-auto">
      <motion.div
        aria-hidden="true"
        className={circle}
        initial={reduceMotion ? false : { scale: 0.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.3, ease: EXPO_OUT }}
      />

      <Link
        href={href}
        aria-label={linkLabel}
        className="group pointer-events-auto absolute top-[10vw] left-[47.7vw] flex w-[50vw] flex-col items-center gap-2 text-center transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-white lg:top-[14vw] lg:left-[73.6vw] lg:w-[21.7vw]"
      >
        <FadeUpText text={caption} delay={1.1} className={label} />
        <FadeUpText
          text={`Today · ${day}`}
          delay={0.7}

          className={label}
        />
        <div className="relative lg:right-[-1.6vw] right-[-4.5vw] flex font-courier text-[32vw] leading-none lg:text-[18vw]">
          {digits.map((digit, index) => (
            <Fade
              key={index}
              translateY={60}
              delay={0.1 + index * 0.2}
              duration={0.6}
            >
              {digit}
            </Fade>
          ))}
        </div>
      </Link>

      <div
        aria-hidden="true"
        className="absolute top-[20vw] left-4 h-40 w-[40vw] lg:hidden"
      >
        <DotField />
      </div>
    </div>
  );
}
