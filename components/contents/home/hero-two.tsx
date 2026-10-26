"use client";

import type { ReactNode } from "react";

import Link from "next/link";

import { motion, useReducedMotion } from "framer-motion";

import DotField from "@/components/animations/dot-field";
import Fade from "@/components/animations/fade";
import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import SurTitle from "@/components/common/sur-title";
import HeroVideo from "@/components/contents/home/hero-video";
import Logo from "@/components/header/logo";
import SubmitEvent from "@/components/header/submit-event";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { DEFAULT_CITY_SLUG, NAV } from "@/constants/nav";
import { useCalendarToday } from "@/hooks/use-calendar-today";
import { dayPath, formatDay } from "@/lib/events/event-list";
import { cn } from "@/lib/utils";


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
    <div className="relative z-60 flex w-full flex-col overflow-hidden bg-red text-white">
      {header}
      <section
        aria-labelledby="hero-heading"
        className="relative lg:min-h-[57.6vw]"
      >
        <SectionWrapper className="relative z-10 items-start gap-9 lg:max-w-[64vw]">
          <SurTitle
            className="text-white"
            content={[cityName, day, count && `${count} today`]
              .filter(Boolean)
              .join(" · ")}
          />

          <Fade
            translateY={16}
            delay={0.1}
            duration={0.6}
            className="w-full lg:w-[52.8vw]"
          >
            <Logo
              variant="white"
              wrapperClassName="w-full"
              className="w-full sm:w-full"
            />
          </Fade>

          <FadeUpText
            as="h1"
            id="hero-heading"
            text="Where Africa’s people, ideas and events meet."
            delay={0.15}
            className="font-montreal text-6xl tracking-mono sm:text-6xl lg:max-w-[52.8vw] xl:text-7xl"
          />
          <FadeUpText
            text="One calendar for what is happening across Africa’s cities."
            delay={0.3}
            className="max-w-155 font-montreal text-lg text-cream sm:text-[22px]"
          />

          <Fade
            delay={0.45}
            duration={0.6}
            className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row"
          >
            <Link href={NAV[0].link} className="w-full sm:w-fit">
              <Button variant="onWhite" size="md" className="w-full">
                <HoverText text="See what’s happening" />
              </Button>
            </Link>
            <SubmitEvent
              variant="outlineWhite"
              size="md"
              className="w-full sm:w-auto"
            />
          </Fade>
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
      <SectionWrapper className="pt-0 sm:pt-0">
        <HeroVideo />
      </SectionWrapper>
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
    "absolute top-0 left-[38.5vw] size-[87vw] rounded-full border-2 border-white lg:top-[2.8vw] lg:left-[63.9vw] lg:size-[52.8vw]";

  return (
    <div className="pointer-events-none relative h-[72vw] lg:absolute lg:inset-0 lg:h-auto">
      <motion.div
        aria-hidden="true"
        className={circle}
        initial={reduceMotion ? false : { scale: 0.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.3, ease: EXPO_OUT }}
      />
      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          className={cn("border-2", circle)}
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: [1, 1.1], opacity: [0.35, 0] }}
          transition={{
            duration: 2.4,
            delay: 1.9,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      )}

      <span
        aria-hidden="true"
        className="absolute top-[7.2vw] left-[90.9vw] hidden size-5.5 lg:block"
      >
        {!reduceMotion && (
          <motion.span
            className="absolute inset-0 rounded-full bg-white"
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: [1, 2.6], opacity: [0.5, 0] }}
            transition={{
              duration: 1.6,
              delay: 1.8,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 1.4,
            }}
          />
        )}
        <span className="relative block size-full animate-jump-in rounded-full bg-white animate-delay-1000" />
      </span>

      <Link
        href={href}
        aria-label={linkLabel}
        className="group pointer-events-auto absolute top-[15vw] left-[57.7vw] flex w-[37vw] flex-col items-center gap-2 text-center transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-white lg:top-[15.3vw] lg:left-[73.6vw] lg:w-[21.7vw]"
      >
        <FadeUpText
          text={`Today · ${day}`}
          delay={0.7}

          className={label}
        />
        <div className="flex font-courier text-[30vw] leading-none lg:text-[18vw]">
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
        <FadeUpText text={caption} delay={1.1} className={label} />
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
