"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import {
  servicesSectionOne,
  servicesSectionTwo,
} from "@/app/(group)/services/variable";
import DrawHorizontalLine from "@/components/animations/draw-horizontal-line";
import DrawVerticalLine from "@/components/animations/draw-vertical-line";
import Fade from "@/components/animations/fade";
import SectionWrapper from "@/components/layout/section-wrapper";
import LenisProvider from "@/components/providers/lenis-provider";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ServicesPage() {
  const [currentImages, setCurrentImages] = useState<Image[]>(
    servicesSectionOne.images,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [hover, setHover] = useState(false);

  const handleOnMouseEnter = (images: Image[], idx: number) => {
    setCurrentImages(images);
    setActiveIndex(idx);
    setHover(true);
  };

  const handleOnMouseLeave = () => {
    setHover(false);
  };

  return (
    <div className="relative flex w-full flex-col overflow-hidden bg-primary-light max-md:min-h-dvh md:h-[calc(100dvh-50px)]">
      <SectionWrapper className="h-full flex-1 grid-cols-1 pb-0 max-4k:px-0 sm:py-0! md:grid md:grid-cols-3 md:flex-row md:px-0">
        <div className="relative w-full md:h-full">
          <div
            className={cn(
              "flex h-[50%] flex-col px-pg-sm sm:px-pg md:p-8 md:pl-pg 2xl:pl-pg-2xl",
              hover && "hidden",
            )}
          >
            <Fade
              className="flex flex-col gap-4 max-md:items-center"
              translateY={0}
              translateX={-12}
            >
              <p className="font-inter text-xs text-primary uppercase max-md:text-center sm:text-xs">
                Our services are divided between two complementary offerings:
                FOLA PR (public relations and brand communications) and Studio
                FOLA (creative strategy and experiential). Together, they form a
                powerful 360° approach to building, elevating, and amplifying
                brands and creative projects — rooted in African innovation and
                driven by cultural relevance on a global stage.
              </p>
            </Fade>
          </div>
          <div
            className={cn(
              "absolute top-0 flex h-full w-full animate-fade-in flex-col max-md:hidden",
              hover && "flex animate-fade-in",
            )}
          >
            <div className="relative flex h-[50%]! w-full flex-none overflow-hidden">
              <div className="relative h-full w-[50%] overflow-hidden">
                <Image
                  {...currentImages[3]}
                  sizes="(min-width: 2560px) 14vw, (min-width: 768px) 16.67vw, 0px"
                  quality={100}
                  className={cn(
                    "absolute z-10 hidden size-full object-cover object-[50%_10%]",
                    hover && "flex animate-fade-in",
                  )}
                />
              </div>
              <div className="relative h-full w-[50%] overflow-hidden">
                <Image
                  {...currentImages[4]}
                  sizes="(min-width: 2560px) 14vw, (min-width: 768px) 16.67vw, 0px"
                  quality={100}
                  className={cn(
                    "absolute z-10 hidden size-full object-cover object-[50%_10%]",
                    hover && "flex animate-fade-in",
                  )}
                />
              </div>
            </div>
            <div className="relative flex h-[50%]! w-full flex-none overflow-hidden">
              <Image
                {...currentImages[1]}
                sizes="(min-width: 2560px) 28vw, (min-width: 768px) 33.33vw, 0px"
                quality={100}
                className={cn(
                  "absolute z-10 flex size-full animate-fade-in object-cover object-[50%_30%]",
                  activeIndex === 1 && "object-[50%_30%]",
                  hover && "flex animate-fade-in",
                )}
              />
            </div>

            <DrawHorizontalLine className="absolute top-[50%] left-0 delay-1500" />
          </div>
        </div>

        <div className="relative h-full w-full overflow-hidden max-md:hidden">
          <div
            className={cn(
              "relative flex h-full w-full animate-fade-in",
              hover && "flex animate-fade-in",
            )}
          >
            <Image
              {...currentImages[2]}
              sizes="(min-width: 2560px) 28vw, (min-width: 768px) 33.33vw, 0px"
              quality={100}
              className={cn(
                "absolute z-10 size-full object-cover object-[50%_50%]",
              )}
            />
            <DrawVerticalLine className="absolute top-0 left-0 max-md:hidden" />
          </div>
          <DrawVerticalLine className="absolute top-0 right-0 delay-1000 max-md:hidden" />
        </div>

        <div className="relative h-full w-full max-md:hidden">
          <div
            onMouseEnter={() =>
              handleOnMouseEnter(
                servicesSectionOne.images,
                servicesSectionOne.id,
              )
            }
            onMouseLeave={handleOnMouseLeave}
            className="relative flex h-[50%]! w-full flex-none overflow-hidden"
          >
            <div
              className={cn(
                "group relative flex h-full flex-col py-4 pr-pg-sm sm:py-8 sm:pr-pg md:p-pg 2xl:pr-pg-2xl",
                hover && activeIndex === 1 && "hidden",
              )}
            >
              <Fade
                translateY={12}
                className="flex flex-col gap-4 font-inter text-primary max-md:items-center"
              >
                <p className="flex gap-2 font-apris text-xs uppercase sm:text-sm">
                  {servicesSectionOne.title}
                </p>
                <div className="w-full max-w-[85%] text-xs uppercase opacity-100 transition-all duration-500 group-hover:opacity-100 max-md:opacity-100!">
                  <p className="">{servicesSectionOne.description}</p>
                  <ol className="mt-2 ml-8 list-disc">
                    {servicesSectionOne.workSpan.map((item) => (
                      <li key={item.text}>{item.text}</li>
                    ))}
                  </ol>
                </div>
              </Fade>
              <Ping className="group-hover:hidden" />
            </div>
            <Image
              {...currentImages[0]}
              sizes="(min-width: 2560px) 28vw, (min-width: 768px) 33.33vw, 0px"
              quality={100}
              className={cn(
                "absolute z-10 hidden size-full object-cover object-center max-md:hidden!",
                hover && activeIndex === 1 && "flex animate-fade-in",
              )}
            />
          </div>

          <div
            onMouseEnter={() =>
              handleOnMouseEnter(
                servicesSectionTwo.images,
                servicesSectionTwo.id,
              )
            }
            onMouseLeave={handleOnMouseLeave}
            className="relative flex h-[50%]! w-full flex-none overflow-hidden"
          >
            <div
              className={cn(
                "group relative flex h-full flex-col py-4 pr-pg-sm sm:py-8 sm:pr-pg md:p-pg 2xl:pr-pg-2xl",
                hover && activeIndex === 0 && "hidden",
              )}
            >
              <Fade
                delay={0.3}
                translateY={12}
                className="flex flex-col gap-4 font-inter text-primary uppercase max-md:items-center"
              >
                <p className="font-apris text-xs max-md:text-center sm:text-sm">
                  {servicesSectionTwo.title}
                </p>
                <div className="w-full max-w-[85%] text-xs opacity-100 transition-all duration-500 group-hover:opacity-100">
                  <p className="">{servicesSectionTwo.description}</p>
                </div>
              </Fade>
              <Ping className="group-hover:hidden" />
            </div>
            <Image
              {...currentImages[0]}
              sizes="(min-width: 2560px) 28vw, (min-width: 768px) 33.33vw, 0px"
              quality={100}
              className={cn(
                "absolute z-10 hidden size-full object-cover object-center",
                hover && activeIndex === 0 && "flex animate-fade-in",
              )}
            />
          </div>

          <DrawHorizontalLine className="absolute top-[50%] left-0 delay-1500" />
        </div>

        <MobileServicesSection section={servicesSectionOne} className="mt-8" />
        <MobileServicesSection section={servicesSectionTwo} />
      </SectionWrapper>

      <div className="relative z-20 flex h-12 w-full flex-none items-center justify-center bg-primary-light px-pg-sm sm:px-pg">
        <DrawHorizontalLine className="absolute top-0 left-0 delay-500" />
        <Link className="mt-1" href="/journal">
          <Button
            variant="link"
            className={cn(
              "hover:text-none font-inter text-xs font-normal sm:text-sm",
            )}
            size="fit"
          >
            Explore Journal
          </Button>
        </Link>
      </div>
    </div>
  );
}

interface MobileServicesSectionProps {
  section: Pick<typeof servicesSectionOne, "title" | "description" | "images"> & {
    workSpan?: typeof servicesSectionOne.workSpan;
  };
  className?: string;
}

const MobileServicesSection = ({
  section,
  className,
}: MobileServicesSectionProps) => {
  return (
    <LenisProvider
      orientation="horizontal"
      className={cn(
        "relative scrollbar-none grid h-fit w-full grid-cols-1 overflow-x-scroll overflow-y-hidden md:hidden",
        className,
      )}
    >
      <DrawHorizontalLine className="absolute top-0 left-0" />
      <div className="flex h-full w-fit">
        <Fade
          translateX={24}
          translateY={0}
          className="flex w-[80dvw] flex-none flex-col gap-4 p-6 pr-6 font-inter"
        >
          <p className="text-xs uppercase font-medium sm:text-xs">
            {section.title}
          </p>
          <div className="w-full text-sm sm:text-sm">
            <p className="">{section.description}</p>
            {section.workSpan && (
              <ol className="mt-2 ml-8 list-disc text-xs! uppercase">
                {section.workSpan.map((item) => (
                  <li key={item.text}>{item.text}</li>
                ))}
              </ol>
            )}
          </div>
        </Fade>
        {section.images.map((image, index) => {
          return (
            <Fade
              delay={index * 0.3}
              translateX={24}
              translateY={0}
              amount={0.1}
              key={index}
              className="relative h-80 flex-none overflow-hidden bg-white"
            >
              <Image {...image} className="h-full w-auto" sizes={`(min-width: 768px) 0px, ${(320 * image.width) / image.height}px`} />
            </Fade>
          );
        })}
      </div>
    </LenisProvider>
  );
};

interface PingProps {
  className?: string;
}
export const Ping = ({ className }: PingProps) => {
  return (
    <span className={cn("relative mt-8 flex size-3 max-md:hidden", className)}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
      <span className="relative inline-flex size-3 rounded-full bg-primary"></span>
    </span>
  );
};
