"use client";

import Image from "next/image";

import Fade from "embla-carousel-fade";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const carousel = [
  { title: "About image IMG_2248", image: "/assets/images/about/IMG_2248.PNG" },
  { title: "About image IMG_2249", image: "/assets/images/about/IMG_2249.PNG" },
  { title: "About image IMG_2250", image: "/assets/images/about/IMG_2250.PNG" },
  { title: "About image IMG_2251", image: "/assets/images/about/IMG_2251.PNG" },
  { title: "About image IMG_2252", image: "/assets/images/about/IMG_2252.PNG" },
  { title: "About image IMG_2253", image: "/assets/images/about/IMG_2253.PNG" },
  { title: "About image IMG_2254", image: "/assets/images/about/IMG_2254.PNG" },
  { title: "About image IMG_2255", image: "/assets/images/about/IMG_2255.PNG" },
  { title: "About image IMG_2256", image: "/assets/images/about/IMG_2256.PNG" },
  { title: "About image IMG_2257", image: "/assets/images/about/IMG_2257.PNG" },
  { title: "About image IMG_2258", image: "/assets/images/about/IMG_2258.PNG" },
  { title: "About image IMG_2259", image: "/assets/images/about/IMG_2259.PNG" },
  { title: "About image IMG_2260", image: "/assets/images/about/IMG_2260.PNG" },
  { title: "About image IMG_2261", image: "/assets/images/about/IMG_2261.PNG" },
  { title: "About image IMG_2262", image: "/assets/images/about/IMG_2262.PNG" },
  { title: "About image IMG_2263", image: "/assets/images/about/IMG_2263.PNG" },
  { title: "About image IMG_2264", image: "/assets/images/about/IMG_2264.PNG" },
];

export default function AboutImages() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-primary-light">
      <div className="relative h-full w-full">
        <Carousel
          delay={3000}
          autoplay
          opts={{ loop: true }}
          plugins={[Fade()]}
          className="z-30 h-full w-full"
        >
          <CarouselContent className="relative h-dvh w-full">
            {carousel.map((item, idx) => (
              <CarouselItem key={item.title} className="relative h-full w-full">
                <div
                  className={cn(
                    "relative size-full transition-opacity duration-1200",
                  )}
                >
                  <Image
                    src={item.image}
                    fill
                    priority={idx === 0}
                    loading="eager"
                    alt={item.title}
                    quality={100}
                    className="size-full object-cover object-[50%_20%]"
                    sizes="(min-width: 1024px) 33vw, 100vw"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
