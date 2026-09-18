"use client";

import Image from "next/image";

import Fade from "@/components/animations/fade";
import FollowCursor from "@/components/ui/follow-cursor";
import ViewMedia, { MediaItem } from "@/components/ui/view-media";
import { cn } from "@/lib/utils";
import { GetGalleryResponse } from "@/sanity/requests/gallery/get-gallery";

interface Props {
  gallery: GetGalleryResponse[];
  className?: string;
}

export default function JournalContent({ gallery, className }: Props) {
  return (
    <div className={cn("h-fit w-full", className)}>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item) => (
          <ViewMedia
            shouldDownload={false}
            media={[item.image] as MediaItem[]}
            key={item.id}
            trigger={
              <FollowCursor color="#fff" className="group w-full">
                <Fade amount={0.2} duration={1} inView={true}>
                  <div className="flex w-full flex-col gap-2 font-inter text-primary uppercase sm:gap-4">
                    <div className="relative aspect-2.5/3 w-full overflow-hidden bg-white">
                      <Image
                        {...item.image}
                        quality={100}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33.33vw"
                        className="size-full object-cover object-center transition-all duration-1000 group-hover:scale-105"
                      />
                    </div>
                    <h1 className="mt-2 text-xs font-semibold sm:mt-2">
                      {item.title}
                    </h1>
                    <p className="text-xs">{item.description}</p>
                  </div>
                </Fade>
              </FollowCursor>
            }
          />
        ))}
      </div>
    </div>
  );
}
