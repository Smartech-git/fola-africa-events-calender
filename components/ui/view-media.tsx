"use client";

import * as React from "react";
import { useState } from "react";

import dynamic from "next/dynamic";
import Image from "next/image";

import { LoaderCircle } from "lucide-react";
import Download from "yet-another-react-lightbox/plugins/download";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import { cn } from "@/lib/utils";

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), {
  ssr: false,
});

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type MediaItem = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
};

interface Props {
  media: MediaItem[];
  trigger: React.ReactNode | ((open: () => void) => React.ReactNode);
  triggerWrapperClassName?: string;
  shouldDownload?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function ViewMedia({
  media,
  trigger,
  triggerWrapperClassName,
  shouldDownload = true,
}: Props) {
  const [current, setCurrent] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);

  return (
    <>
      <div
        className={cn(
          "flex w-fit cursor-pointer",
          typeof trigger !== "function" && "h-fit",
          triggerWrapperClassName,
        )}
        onClick={typeof trigger === "function" ? undefined : open}
      >
        {typeof trigger === "function" ? trigger(open) : trigger}
      </div>

      <Lightbox
        open={isOpen}
        index={current}
        animation={{
          fade: 500,
        }}
        close={() => setIsOpen(false)}
        plugins={[Zoom, ...(shouldDownload ? [Download] : [])]}
        slides={media.map((item) => ({
          src: item.src,
          alt: item.alt || "",
          width: item.width || 500,
          height: item.height || 500,
        }))}
        zoom={{ maxZoomPixelRatio: 1.2 }}
        on={{
          click: () => setIsOpen(false),
          view: ({ index }) => setCurrent(index),
        }}
        render={{
          slide: ({ slide }) => <LightboxSlide slide={slide} />,
          iconClose: () => (
            <span className="font-inter! text-xs font-semibold text-primary-light! uppercase sm:text-sm">
              CLose
            </span>
          ),
          iconZoomIn: () => <></>,
          iconZoomOut: () => <></>,
        }}
        styles={{
          button: {
            filter: "none",
            boxShadow: "none",
            color: "var(--color-primary-light)",
          },
          container: {
            backgroundColor: "#000",
          },
        }}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SLIDE SWITCHER                                 */
/* -------------------------------------------------------------------------- */

type SlideProps = {
  slide: {
    src: string;
    width?: number;
    height?: number;
    alt?: string;
  };
};

const LightboxSlide = ({ slide }: SlideProps) => {
  const isPdf = slide.src.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    return <LightboxSlidePDF src={slide.src} />;
  }

  return <LightboxSlideImage slide={slide} />;
};

/* -------------------------------------------------------------------------- */
/*                                IMAGE SLIDE                                  */
/* -------------------------------------------------------------------------- */

const LightboxSlideImage = ({ slide }: SlideProps) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [slide.src]);

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoaderCircle className="size-10 animate-spin text-white" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-sm">
          Failed to load image
        </div>
      )}

      <Image
        sizes="125vw"
        quality={90}
        src={slide.src}
        width={slide.width || 500}
        height={slide.height || 500}
        alt={slide.alt ?? ""}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className="h-full w-full object-contain"
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  PDF SLIDE                                  */
/* -------------------------------------------------------------------------- */

const LightboxSlidePDF = ({ src }: { src: string }) => {
  return (
    <div className="h-full w-full bg-white">
      <iframe src={src} className="h-full w-full" loading="lazy" />
    </div>
  );
};
