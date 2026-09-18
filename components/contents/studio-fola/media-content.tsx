"use client";

import { memo, useEffect, useId, useRef, useState } from "react";

import Image from "next/image";

import type { LenisRef } from "lenis/react";
import { Plus } from "lucide-react";

import DrawHorizontalLine from "@/components/animations/draw-horizontal-line";
import Fade from "@/components/animations/fade";
import SectionWrapper from "@/components/layout/section-wrapper";
import LenisProvider from "@/components/providers/lenis-provider";
import Button from "@/components/ui/button";
import PortableText from "@/components/ui/portable-text";
import { cn } from "@/lib/utils";
import { sanityUrlBuilder } from "@/sanity/requests/helpers";
import { GetStudioFolaResponse } from "@/sanity/requests/studio-fola/get-studio-fola";
import type { SanityImageReference } from "@/sanity/types";

interface Props {
  data: GetStudioFolaResponse[];
}
export default function MediaContent({ data }: Props) {
  const [activeId, setActiveId] = useState<string | undefined>(data[0]?.id);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const scrollRef = useRef<LenisRef>(null);
  const projectRefs = useRef(new Map<string, HTMLDivElement>());
  const navigationRef = useRef<HTMLDivElement>(null);
  const detailsId = useId();
  const activeProject = data.find((item) => item.id === activeId) ?? data[0];

  useEffect(() => {
    const viewport = scrollRef.current?.wrapper;
    if (!viewport) return;
    let frame = 0;
    const updateActiveProject = () => {
      const bounds = viewport.getBoundingClientRect();
      let visibleWidth = 0;
      let visibleId: string | undefined = data[0]?.id;
      for (const item of data) {
        const rect = projectRefs.current.get(item.id)?.getBoundingClientRect();
        if (!rect) continue;
        const width = Math.max(
          0,
          Math.min(rect.right, bounds.right) - Math.max(rect.left, bounds.left),
        );
        if (width > visibleWidth) {
          visibleWidth = width;
          visibleId = item.id;
        }
      }
      // Keep a narrow final project selectable at the end of the strip.
      if (
        viewport.scrollLeft > 0 &&
        viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 2
      ) {
        visibleId = data.at(-1)?.id;
      }
      setActiveId(visibleId);
    };
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActiveProject);
    };
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(viewport);
    projectRefs.current.forEach((element) => observer.observe(element));
    viewport.addEventListener("scroll", scheduleUpdate, { passive: true });
    scheduleUpdate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      viewport.removeEventListener("scroll", scheduleUpdate);
    };
  }, [data]);

  useEffect(() => {
    const navigation = navigationRef.current;
    const button = navigation?.querySelector<HTMLButtonElement>(
      '[aria-current="true"]',
    );
    if (!navigation || !button) return;
    const bounds = navigation.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    if (rect.left < bounds.left || rect.right > bounds.right)
      navigation.scrollLeft += rect.left - bounds.left;
  }, [activeProject?.id]);

  const scrollToProject = (id: string) => {
    const target = projectRefs.current.get(id);
    const viewport = scrollRef.current?.wrapper;
    if (!target || !viewport) return;
    const left =
      target.getBoundingClientRect().left -
      viewport.getBoundingClientRect().left +
      viewport.scrollLeft;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (scrollRef.current?.lenis)
      scrollRef.current.lenis.scrollTo(left, { immediate: reducedMotion });
    else
      viewport.scrollTo({
        left,
        behavior: reducedMotion ? "instant" : "smooth",
      });
  };

  if (!activeProject) return null;

  return (
    <div
      className="relative h-[70dvh] w-full"
      onKeyDown={(event) => {
        if (event.key === "Escape") setDetailsOpen(false);
      }}
    >
      <DrawHorizontalLine className="absolute top-0 left-0" />
      <SectionWrapper className="relative h-10 w-full flex-row items-center gap-12 py-0 sm:gap-38 sm:py-0">
        <Button
          onPress={() => setDetailsOpen((open) => !open)}
          aria-expanded={detailsOpen}
          aria-controls={detailsId}
          variant="flat"
          endContent={
            <Plus
              className={cn(
                "-mt-0.5 transition-transform",
                detailsOpen && "rotate-45",
              )}
              size={12}
            />
          }
          className="text-xs leading-none"
          size="fit"
        >
          Details
        </Button>
        <div
          ref={navigationRef}
          className="scrollbar-none flex min-w-0 flex-1 items-center gap-6 overflow-x-auto"
          aria-label="Studio FOLA projects"
        >
          {data.map((item, index) => (
            <Button
              key={item.id}
              onPress={() => scrollToProject(item.id)}
              aria-current={activeProject.id === item.id ? "true" : undefined}
              aria-label={`${index + 1}: ${item.title}`}
              className={cn(
                "max-w-full text-xs text-secondary",
                activeProject.id === item.id && "font-medium text-primary",
              )}
              size="fit"
              variant="link"
            >
              {activeProject.id === item.id ? (
                <span className="truncate uppercase">[{item.title}]</span>
              ) : (
                index + 1
              )}
            </Button>
          ))}
        </div>
      </SectionWrapper>
      <LenisProvider
        ref={scrollRef}
        orientation="horizontal"
        className="h-[calc(70dvh-40px)] overflow-x-scroll overflow-y-hidden *:relative *:h-full *:min-h-0 *:w-fit"
      >
        <div className="flex h-[calc(70dvh-40px)] w-fit cursor-grab flex-row gap-1">
          {data.map((item) => (
            <div
              key={item.id}
              ref={(element) => {
                if (element) projectRefs.current.set(item.id, element);
                else projectRefs.current.delete(item.id);
              }}
              role="group"
              aria-label={item.title}
              className="flex h-full flex-none gap-1"
            >
              {item.images.map((image, idx) => (
                <ProjectImage
                  key={image._key ?? image.asset._ref}
                  image={image}
                  index={idx}
                />
              ))}
            </div>
          ))}
        </div>
      </LenisProvider>

      <SectionWrapper
        id={detailsId}
        hidden={!detailsOpen}
        className="absolute top-10 left-0 z-30 h-[calc(70dvh-40px)] w-full animate-fade-in overflow-y-auto bg-primary-light/70 font-inter backdrop-blur-md"
      >
        <PortableText content={activeProject.body} />
      </SectionWrapper>
    </div>
  );
}

const ProjectImage = memo(function ProjectImage({
  image,
  index,
}: {
  image: SanityImageReference;
  index: number;
}) {
  return (
    <Fade
      amount={0.2}
      translateX={24}
      translateY={0}
      inView={true}
      delay={index * 0.3}
      className="h-full w-auto flex-none"
    >
      <Image
        src={sanityUrlBuilder(image).width(1200).url()}
        alt={image.alt ?? ""}
        width={1200}
        height={900}
        sizes="calc(93.333333dvh - 53.333333px)"
        className="h-full w-auto bg-primary"
        quality={100}
      />
    </Fade>
  );
});
