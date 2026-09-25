"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { motion, useInView, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface HoverMediaItem {
  id: string;
  src: string;
}

interface HoverMediaProps {
  items: readonly HoverMediaItem[];
  activeId?: string | null;
  className?: string;
  interval?: number;
}

const hoverQuery = "(width > 640px) and (hover: hover) and (pointer: fine)";

function subscribeToHoverMode(onChange: () => void) {
  const query = window.matchMedia(hoverQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getHoverMode = () => window.matchMedia(hoverQuery).matches;
const getServerHoverMode = () => null;

export default function HoverMedia({
  items,
  activeId = null,
  className,
  interval = 4500,
}: HoverMediaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const inView = useInView(ref, { amount: 0.25 });
  const shouldLoad = useInView(ref, { once: true, margin: "100px" });
  const canHover = useSyncExternalStore(
    subscribeToHoverMode,
    getHoverMode,
    getServerHoverMode,
  );
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<Record<string, string>>({});

  const allLoaded = items.every((item) => loaded[item.id] === item.src);

  useEffect(() => {
    if (
      canHover !== false ||
      !inView ||
      !allLoaded ||
      reduceMotion ||
      items.length < 2
    )
      return;

    const timer = window.setInterval(
      () => {
        setIndex((current) => (current + 1) % items.length);
      },
      Math.max(1000, interval),
    );

    return () => window.clearInterval(timer);
  }, [canHover, inView, allLoaded, interval, items.length, reduceMotion]);

  const selectedId = canHover
    ? activeId
    : canHover === false
      ? items[index % items.length]?.id
      : null;
  const visible = inView && selectedId != null;

  useEffect(() => {
    for (const item of items) {
      const video = videoRefs.current[item.id];
      if (!video) continue;
      if (
        visible &&
        selectedId === item.id &&
        !reduceMotion &&
        loaded[item.id] === item.src
      ) {
        void video.play().catch(() => {
          // Playback can be interrupted when the active control changes.
        });
      } else {
        video.pause();
      }
    }
  }, [items, loaded, reduceMotion, selectedId, visible]);

  useEffect(() => {
    const videos = videoRefs.current;
    return () => {
      Object.values(videos).forEach((video) => video?.pause());
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none relative aspect-video h-18 shrink-0",
        className,
      )}
    >
      <motion.div
        className="absolute inset-0"
        animate={
          visible && !reduceMotion
            ? { y: [0, -5, 0], rotate: [0, 1.5, 0] }
            : { y: 0, rotate: 0 }
        }
        transition={
          visible && !reduceMotion
            ? { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.25 }
        }
      >
        {shouldLoad &&
          items.map((item) => (
            <motion.div
              key={item.id}
              className="absolute inset-0 overflow-hidden"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{
                opacity:
                  visible &&
                  selectedId === item.id &&
                  loaded[item.id] === item.src
                    ? 1
                    : 0,
                scale: visible && selectedId === item.id ? 1 : 0.96,
              }}
              transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
            >
              <video
                ref={(video) => {
                  videoRefs.current[item.id] = video;
                }}
                src={item.src}
                autoPlay={visible && selectedId === item.id && !reduceMotion}
                loop
                muted
                playsInline
                preload="auto"
                className="size-full object-cover"
                onLoadedData={() =>
                  setLoaded((current) => ({ ...current, [item.id]: item.src }))
                }
              />
            </motion.div>
          ))}
      </motion.div>
    </div>
  );
}
