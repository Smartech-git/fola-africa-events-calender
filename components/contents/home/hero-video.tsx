"use client";

import { useRef, useState } from "react";

import { AudioLines, AudioLinesOff } from "lucide-react";

import Fade from "@/components/animations/fade";
import FadeUpText from "@/components/animations/fade-up-text";
import MaskedHeading from "@/components/animations/masked-heading";
import Button from "@/components/ui/button";

export default function HeroVideo() {
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Fade
      ref={containerRef}
      translateY={120}
      duration={0.6}
      className="relative mt-4 flex aspect-2/3 w-full justify-center overflow-hidden sm:aspect-video"
    >
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-dark-gray">
        <FadeUpText
          delay={1.3}
          className="absolute top-4 left-4 z-10 w-80 text-sm tracking-cou text-white uppercase"
          text="IN THE MOMENT / BLACK COFFEE IN LAGOS"
        />

        <video
          loop
          autoPlay
          muted={muted}
          playsInline
          preload="metadata"
          poster="/assets/home/hero-video-thumbnail.jpg"
          className="size-full object-cover"
        >
          <source src="/assets/home/hero-video.mp4" type="video/mp4" />
        </video>
        <MaskedHeading
          text="Be where it happens"
          mediaType="video"
          src="/assets/home/hero-video.mp4"
          poster="/assets/images/home/hero-video-thumbnail.jpg"
          parallax={26}
          trigger="view"
          drift={18}
          className="absolute z-10 w-auto font-montreal text-7xl sm:text-7xl lg:text-[200px]"
        />
        <Button
          onClick={() => setMuted((prev) => !prev)}
          variant="outlineWhite"
          className="absolute right-4 bottom-4 z-10 rounded-full text-white"
          size="icon"
        >
          {muted ? <AudioLinesOff size={16} /> : <AudioLines size={16} />}
        </Button>
      </div>
    </Fade>
  );
}
