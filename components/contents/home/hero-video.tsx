"use client";

import { useRef, useState } from "react";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { AudioLines, AudioLinesOff } from "lucide-react";

import FadeUpText from "@/components/animations/fade-up-text";
import MaskedHeading from "@/components/animations/masked-heading";
import Button from "@/components/ui/button";

export default function HeroVideo() {
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: false, amount: 0.3 });
  const reduceMotion = useReducedMotion();

  return (
    <div
      ref={containerRef}
      className="relative mt-4 flex sm:aspect-video aspect-2/3 w-full justify-center overflow-hidden"
    >
      <motion.div
        className="relative flex h-full items-center justify-center overflow-hidden bg-dark-gray"
        initial={{ width: "0%" }}
        animate={{ width: inView || reduceMotion ? "100%" : "0%" }}
        transition={{ duration: reduceMotion ? 0 : 1, ease: "easeIn" }}
      >
        <FadeUpText
          delay={1.3}
          className="absolute top-4 left-4 z-10 w-40 text-xs text-white uppercase"
          text="IN THE MOMENT / LAGOS FASHION WEEK"
        />
        <video
          loop
          autoPlay
          muted={muted}
          playsInline
          preload="metadata"
          poster="/assets/images/home/hero-video-thumbnail.jpg"
          className="size-full object-cover"
        >
          <source src="/assets/videos/hero-video.mp4" type="video/mp4" />
        </video>
        <MaskedHeading
          text="Be where it happens"
          mediaType="video"
          src="/assets/videos/hero-video.mp4"
          poster="/assets/images/home/hero-video-thumbnail.jpg"
          parallax={26}
          trigger="view"
          drift={18}
          brightness={1}
          saturation={1}
          grayscale={false}
          duration={1.1}
          stagger={0.09}
          className="absolute z-10 w-auto text-4xl font-medium tracking-tight text-balance uppercase sm:text-7xl lg:text-9xl"
        />
        <Button
          onClick={() => setMuted((prev) => !prev)}
          variant="flat"
          className="absolute right-4 bottom-4 z-10 text-white"
          size="fit"
        >
          {muted ? <AudioLinesOff size={20} /> : <AudioLines size={20} />}
        </Button>
      </motion.div>
    </div>
  );
}
