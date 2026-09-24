import Image from "next/image";
import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import SectionWrapper from "@/components/layout/section-wrapper";

interface OnTheRadarProps {
  citySlug?: string;
}

function ExploreIndustry({
  industry,
  citySlug,
}: {
  industry: string;
  citySlug?: string;
}) {
  const href = citySlug
    ? `/events/${encodeURIComponent(citySlug)}?industry=${industry}`
    : "#cities";

  return (
    <Link
      href={href}
      className="group/radar inline-flex min-h-11 w-fit items-center gap-2 text-xs font-medium uppercase underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <HoverText text={`Explore ${industry}`} />
      <ArrowUpRight
        aria-hidden="true"
        className="size-3 shrink-0 transition-transform duration-300 group-hover/radar:translate-x-1 group-focus-visible/radar:translate-x-1 motion-reduce:transition-none"
      />
    </Link>
  );
}

export default function OnTheRadar({ citySlug }: OnTheRadarProps) {
  return (
    <SectionWrapper
      role="region"
      aria-labelledby="radar-heading"
      className="gap-8 lg:gap-12"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <FadeUpText
          id="radar-heading"
          as="h2"
          text="On the radar"
          className="font-apris text-5xl leading-none font-light uppercase sm:text-6xl lg:text-7xl"
        />
        <FadeUpText
          text={"The people. The places.\nThe moments that move us."}
          className="text-right text-xs uppercase"
        />
      </div>

      <div className="grid items-start gap-12 md:grid-cols-[1.592fr_1fr] lg:gap-12">
        <article className="flex min-w-0 flex-col items-start gap-4">
          <div className="relative aspect-[796/508] w-full overflow-hidden bg-secondary">
            <Image
              src="/assets/images/home/01-technology.png"
              alt="Panel discussions at the Africa Technology Expo"
              fill
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-cover object-top"
            />
          </div>
          <FadeUpText
            text={`01 / Technology · Lagos`}
            className="text-xs font-medium tracking-wider uppercase"
          />
          <FadeUpText
            as="h3"
            text={"The next\nbig idea."}
            className="font-apris text-5xl leading-[0.95] font-light uppercase sm:text-6xl lg:text-[80px]"
          />
          <ExploreIndustry industry="technology" citySlug={citySlug} />
        </article>

        <article className="flex min-w-0 flex-col items-start gap-4 md:pt-16 lg:pt-24">
          <div className="aspect-square w-full overflow-hidden bg-secondary">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Art and creative expression across Africa"
              className="size-full object-cover"
            >
              <source src="/assets/images/home/02-arts.mp4" type="video/mp4" />
            </video>
          </div>
          <FadeUpText
            text={`02 / Art · Across the cities`}
            className="text-xs font-medium tracking-wider uppercase"
          />
          <FadeUpText
            as="h3"
            text={"New ways\nof seeing."}
            className="font-apris text-5xl leading-[0.97] font-light uppercase italic lg:text-6xl"
          />
          <ExploreIndustry industry="art" citySlug={citySlug} />
        </article>
      </div>

      <article className="grid items-center gap-6 pt-4 md:grid-cols-[0.58fr_1fr] md:gap-10 md:pt-8 lg:gap-12 lg:pt-12">
        <div className="order-2 flex min-w-0 flex-col items-start gap-4 md:order-1 lg:gap-6">
          <FadeUpText
            text={`03 / Music · After hours`}
            className="text-xs font-medium tracking-wider uppercase"
          />
          <FadeUpText
            as="h3"
            text={"The city\ndoesn’t\nsleep."}
            className="font-apris text-5xl leading-[0.95] font-light uppercase sm:text-6xl lg:text-[76px]"
          />
          <FadeUpText
            text={"From first set to last dance.\nFind your next night out."}
            className="leading-relaxed uppercase text-xs"
          />
          <ExploreIndustry industry="music" citySlug={citySlug} />
        </div>
        <div className="order-1 aspect-[820/508] w-full overflow-hidden bg-secondary md:order-2">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Live music and nightlife in Lagos"
            className="size-full object-cover"
          >
            <source src="/assets/images/home/03-music.mp4" type="video/mp4" />
          </video>
        </div>
      </article>
    </SectionWrapper>
  );
}
