import Image from "next/image";

import DotField from "@/components/animations/dot-field";
import { cn } from "@/lib/utils";
import type { PublicEvent } from "@/requests/helpers/types";

interface Props {
  className?: string;
  artwork?: PublicEvent["artwork"];
}

export default function EventArtwork({ className, artwork }: Props) {
  return (
    <figure
      className={cn(
        "relative flex aspect-4/5 w-full shrink-0 flex-col justify-end gap-4 overflow-hidden bg-red p-8",
        className,
      )}
    >
      <div aria-hidden="true" className="absolute inset-2">
        <DotField />
      </div>
      {artwork && (
        <>
          <div className="relative z-10 min-h-0 flex-1">
            <Image
              src={artwork.detail.url}
              alt={artwork.alt}
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              unoptimized
              priority
              className="object-contain"
            />
          </div>
          <figcaption className="relative z-10 font-courier text-xs tracking-cou text-white uppercase">
            Event artwork · Supplied by the organiser
          </figcaption>
        </>
      )}
    </figure>
  );
}
