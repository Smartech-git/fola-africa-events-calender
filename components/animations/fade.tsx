"use client";

import type { ReactNode, RefObject } from "react";

import { motion, type HTMLMotionProps } from "framer-motion";

interface FadeProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  inView?: boolean;
  translateY?: number;
  translateX?: number;
  duration?: number;
  delay?: number;
  once?: boolean;
  amount?: number;
  viewportRef?: RefObject<HTMLElement | null>;
}

export default function Fade({
  children,
  className,
  inView = true,
  translateY = 24,
  translateX = 0,
  duration = 0.3,
  delay = 0,
  once = true,
  amount = 0.2,
  viewportRef,
  ...props
}: FadeProps) {
  return (
    <motion.div
      {...props}
      className={className}
      initial={{ opacity: 0, y: translateY, x: translateX }}
      {...(inView
        ? {
            whileInView: { opacity: 1, y: 0, x: 0 },
            viewport: { once, amount, root: viewportRef },
          }
        : {
            animate: { opacity: 1, y: 0, x: 0 },
          })}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
