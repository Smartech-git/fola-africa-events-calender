import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import SectionWrapper from "@/components/layout/section-wrapper";
import type { Cities as CitiesType } from "@/requests/get-cities";

interface Props {
  cities: CitiesType;
}

export default function Cities({ cities }: Props) {
  return (
    <SectionWrapper
      id="cities"
      role="region"
      aria-labelledby="cities-heading"
      className="gap-10 bg-secondary py-12 sm:py-16 lg:flex-row lg:gap-12"
    >
      <div className="flex flex-col items-start gap-6 lg:w-[35%] lg:shrink-0">
        <FadeUpText
          text="Your city. Your calendar."
          className="text-xs font-medium uppercase"
        />
        <FadeUpText
          id="cities-heading"
          as="h2"
          text={"Find your city."}
          className="font-apris text-6xl sm:max-w-60 font-light  uppercase sm:text-7xl lg:text-[108px]"
        />
        <FadeUpText
          text={`${cities.totalDocs === 6 ? "Six cultural capitals." : "Cultural capitals across Africa."}\nOne connected continent.`}
          className="text-xs w-full max-sm:text-right uppercase"
        />
      </div>

      <nav aria-label="Browse events by city" className="w-full min-w-0 flex-1">
        {cities.data.length ? (
          cities.data.map((city, index) => (
            <Link
              key={city.id}
              href={`/events/${encodeURIComponent(city.slug)}`}
              className="group/city flex min-h-22 w-full items-center justify-between gap-4 border-b border-light-gray py-5 pr-2 text-dark-gray transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:min-h-25"
            >
              <HoverText
                text={city.name}
                className="font-apris text-3xl leading-tight font-light tracking-tight uppercase sm:text-5xl xl:text-6xl"
              />
              <span className="flex shrink-0 items-center gap-3 sm:gap-5">
                <HoverText
                  text={`${String(index + 1).padStart(2, "0")} / ${city.country} · ${city.timezoneLabel}`}
                  className="max-w-32 text-right text-xs leading-relaxed font-medium tracking-wide uppercase sm:max-w-48 sm:text-xs"
                />
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 shrink-0 transition-transform duration-300 group-hover/city:translate-x-1.5 group-focus-visible/city:translate-x-1.5 motion-reduce:transition-none sm:size-5"
                />
              </span>
            </Link>
          ))
        ) : (
          <FadeUpText
            text="New cities are on the way."
            className="py-6 text-sm uppercase"
          />
        )}
      </nav>
    </SectionWrapper>
  );
}
