"use client";

import { ReactNode, type Ref } from "react";

import { Orientation } from "lenis";
import { ReactLenis, type LenisRef } from "lenis/react";

import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  orientation?: Orientation;
  root?: boolean | "asChild" | undefined;
  className?: string;
  ref?: Ref<LenisRef>;
}

export default function LenisProvider({
  children,
  orientation = "vertical",
  root = false,
  className,
  ref,
}: Props) {
  return (
    <ReactLenis
      ref={ref}
      root={root}
      options={{
        duration: 1.2, // Scroll duration (higher = slower/smoother)
        lerp: 0.06, // Smoothness (lower = smoother, higher = snappier)
        smoothWheel: true,
        syncTouch: false,
        orientation: orientation,
        allowNestedScroll: true,
      }}
      className={cn(
        "relative scrollbar-thin scrollbar-none h-dvh w-full overflow-y-scroll *:min-h-dvh",
        className,
      )}
    >
      {children}
    </ReactLenis>
  );
}
