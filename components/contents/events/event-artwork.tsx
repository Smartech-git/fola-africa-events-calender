import Image from "next/image";

import DotField from "@/components/animations/dot-field";
import { cn } from "@/lib/utils";
import type { PublicEvent } from "@/requests/helpers/types";

interface Props {
  className?: string;
  artwork?: PublicEvent["artwork"];
}

export default function EventArtwork({ className, artwork }: Props) {
  if (artwork)
    return (
      <figure className={cn("flex w-full shrink-0 flex-col gap-3", className)}>
        <Image
          src={artwork.detail.url}
          width={artwork.detail.width}
          height={artwork.detail.height}
          alt={artwork.alt}
          sizes="(min-width: 1024px) 38vw, 100vw"
          // Payload already stores fixed WebP sizes; skip a second resize.
          unoptimized
          priority
          className="h-auto w-full border border-ink/10"
        />
        <figcaption className="font-courier text-xs tracking-cou text-ink/60 uppercase">
          Event artwork · Supplied by the organiser
        </figcaption>
      </figure>
    );

  return (
    <figure
      className={cn(
        "relative flex aspect-4/5 w-full shrink-0 flex-col justify-end overflow-hidden bg-red p-6",
        className,
      )}
    >
      <div aria-hidden="true" className="absolute inset-3.5">
        <DotField />
      </div>
    </figure>
  );
}
