"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { motion, useInView, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

interface DotFieldProps {
  className?: string;
  /** Distance between dot centres, in px. */
  gap?: number;
  /** Dot diameter, in px. */
  dotSize?: number;
  color?: string;
  /** Opacity of a dot at rest. */
  restOpacity?: number;
  /** Share of dots (0 to 1) that light up over time. */
  activeRatio?: number;
  /** Shortest and longest time a dot takes to light up and fade, in seconds. */
  minDuration?: number;
  maxDuration?: number;
  /** Longest pause before a dot lights up again, in seconds. */
  maxRepeatDelay?: number;
  /** Changes the random pattern while keeping it stable between renders. */
  seed?: number;
}

interface Dot {
  key: number;
  x: number;
  y: number;
  active: boolean;
  duration: number;
  delay: number;
  repeatDelay: number;
}

// Small seeded random generator so each dot keeps its timing across re-renders.
const seededRandom = (seed: number) => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const countDots = (length: number, gap: number, dotSize: number) =>
  length < dotSize ? 0 : Math.floor((length - dotSize) / gap) + 1;

export default function DotField({
  className,
  gap = 24,
  dotSize = 6,
  color = "#FFFFFF",
  restOpacity = 0.22,
  activeRatio = 0.7,
  minDuration = 1.6,
  maxDuration = 3.2,
  maxRepeatDelay = 8,
  seed = 1,
}: DotFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const inView = useInView(containerRef, { amount: 0 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height },
      );
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const dots = useMemo<Dot[]>(() => {
    const cols = countDots(size.width, gap, dotSize);
    const rows = countDots(size.height, gap, dotSize);
    if (!cols || !rows) return [];

    // Centre the grid so the leftover space is shared on both sides.
    const offsetX = (size.width - ((cols - 1) * gap + dotSize)) / 2;
    const offsetY = (size.height - ((rows - 1) * gap + dotSize)) / 2;

    return Array.from({ length: cols * rows }, (_, index) => {
      const random = seededRandom(seed * 100_003 + index);

      return {
        key: index,
        x: offsetX + (index % cols) * gap,
        y: offsetY + Math.floor(index / cols) * gap,
        active: random() < activeRatio,
        duration: minDuration + random() * (maxDuration - minDuration),
        delay: random() * maxRepeatDelay,
        repeatDelay: 1 + random() * maxRepeatDelay,
      };
    });
  }, [
    size,
    gap,
    dotSize,
    activeRatio,
    minDuration,
    maxDuration,
    maxRepeatDelay,
    seed,
  ]);

  const animate = inView && !reduceMotion;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none relative size-full overflow-hidden",
        className,
      )}
    >
      {dots.map((dot) => (
        <motion.span
          key={dot.key}
          className="absolute rounded-full"
          style={{
            left: dot.x,
            top: dot.y,
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
          }}
          initial={{ opacity: restOpacity }}
          animate={
            animate && dot.active
              ? { opacity: [restOpacity, 1, 1, restOpacity] }
              : { opacity: reduceMotion && dot.active ? 1 : restOpacity }
          }
          transition={
            animate && dot.active
              ? {
                  duration: dot.duration,
                  times: [0, 0.3, 0.7, 1],
                  ease: "easeInOut",
                  delay: dot.delay,
                  repeat: Infinity,
                  repeatDelay: dot.repeatDelay,
                }
              : { duration: 0.4 }
          }
        />
      ))}
    </div>
  );
}
