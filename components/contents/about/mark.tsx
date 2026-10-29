"use client";

import type { ReactNode } from "react";

import Image from "next/image";

import { motion, useReducedMotion } from "framer-motion";

import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import Logo from "@/components/header/logo";
import SectionWrapper from "@/components/layout/section-wrapper";
import DateCircle from "@/components/ui/date-circle";
import { SITE_NAME } from "@/constants/brand";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

const BODY = [
  "The circle at the centre of the Happenings wordmark begins with the O in “Of” and extends throughout the identity as a marker of dates, moments and gatherings.",
  "The Braille inspired symbol carries that language further, using a system of dots to express visibility, recognition and connection.",
];

function Appear({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.6 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

const CARDS: { label: string; art: ReactNode }[] = [
  {
    label: "01 — Wordmark",
    art: (
      <Image
        src="/assets/brand/wordmark-white.svg"
        width={360}
        height={27}
        alt={SITE_NAME}
        className="h-auto w-60 max-w-full"
      />
    ),
  },
  {
    label: "02 — The O",
    art: (
      <Appear delay={0.35}>
        <span className="block size-16 rounded-full bg-white sm:size-24" />
      </Appear>
    ),
  },
  {
    label: "03 — The circle",
    art: (
      <Appear delay={0.45}>
        <span className="block size-18 rounded-full border-[1.5px] border-white sm:size-28" />
      </Appear>
    ),
  },
  {
    label: "04 — The date",
    art: (
      <div className="flex items-center gap-3.5 font-courier text-xl tracking-cou sm:text-2xl">
        <span>11</span>
        <Appear delay={0.55}>
          <DateCircle variant="outlineWhite">12</DateCircle>
        </Appear>
        <span>13</span>
      </div>
    ),
  },
];

export default function Mark() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="about-mark"
      className="w-full overflow-hidden bg-red text-white"
    >
      <SectionWrapper className="gap-12">
        <SurTitle
          as="h2"
          id="about-mark"
          dot
          content="The mark"
          className="text-white"
        />
        <FadeUpText
          text="The O becomes the circle. The circle finds the date"
          className="font-montreal text-3xl font-medium tracking-mono sm:text-[56px]"
        />

        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {CARDS.map((card, index) => (
            <motion.li
              key={card.label}
              initial={reduceMotion ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.4, once: true }}
              transition={{ duration: 0.9, delay: index * 0.1, ease: EXPO_OUT }}
              className="flex h-42 flex-col border border-white/45 px-3.5 pt-3.5 pb-4 sm:h-65 sm:px-5 sm:pt-4.5 sm:pb-5"
            >
              <span className="font-courier text-xs tracking-cou uppercase">
                {card.label}
              </span>
              <div className="flex flex-1 items-center justify-center">
                {card.art}
              </div>
            </motion.li>
          ))}
        </ul>

        <div className="grid gap-6 sm:grid-cols-2 sm:gap-12">
          {BODY.map((paragraph, index) => (
            <FadeUpText
              key={index}
              text={paragraph}
              delay={index * 0.1}
              className="font-montreal text-2xl sm:text-2xl"
            />
          ))}
        </div>

        <div className="flex flex-col gap-4 pt-6">
          <SurTitle
            content={`The symbol · ${SITE_NAME}, in Braille`}
            className="text-white"
          />
          <Logo type="symbol" />
        </div>

        <div className="flex flex-col gap-3 border-t border-white/35 pt-10">
          <SurTitle
            content="A simple idea runs through both:"
            className="text-white"
          />
          <FadeUpText
            text="Make what is happening easier to see"
            className="font-montreal text-5xl font-medium tracking-mono uppercase sm:text-6xl xl:text-7xl"
          />
        </div>
      </SectionWrapper>
    </section>
  );
}
