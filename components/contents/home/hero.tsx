import React from "react";

import { Dot } from "lucide-react";

import DrawHorizontalLine from "@/components/animations/draw-horizontal-line";
import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import PixelBlast from "@/components/animations/pixel-blast";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { INDUSTRIES } from "@/payload/constants";

export default function Hero() {
  return (
    <SectionWrapper className="py-8">
      <FadeUpText
        className="relative z-10 font-apris text-5xl font-medium tracking-wider uppercase md:text-7xl lg:text-8xl"
        text={`AFRICA’S\nEVENTS CALENDAR`}
      />
      <FadeUpText
        delay={0.3}
        className="relative z-10 font-inter text-xs uppercase sm:text-sm"
        text={`The industry calendar for Africa’s key cities.`}
      />
      <div className="relative z-10 mt-12 flex flex-wrap items-center">
        {INDUSTRIES.map((item) => (
          <span
            className="group flex items-center text-xs uppercase"
            key={item.label}
          >
            {item.value}
            <Dot size={24} className="text-primary group-last:hidden" />
          </span>
        ))}
      </div>
      <div className="relative z-10 mt-8 flex w-full flex-col items-center gap-4 sm:w-fit sm:flex-row">
        <Button className="max-sm:w-full!">
          <HoverText text="Explore events" />
        </Button>
        <Button variant="bordered" className="max-sm:w-full!">
          <HoverText text="Submit an event" />
        </Button>
      </div>

      <DrawHorizontalLine className="absolute bottom-0 left-0" />

      <PixelBlast
        variant="square"
        pixelSize={6}
        color="#EBC9AC"
        patternScale={2}
        patternDensity={1.2}
        pixelSizeJitter={0}
        enableRipples
        rippleSpeed={0.4}
        rippleThickness={0.12}
        rippleIntensityScale={1.5}
        liquid={true}
        liquidStrength={0.12}
        liquidRadius={1.2}
        liquidWobbleSpeed={5}
        speed={0.5}
        edgeFade={0.1}
        transparent
      />
    </SectionWrapper>
  );
}
