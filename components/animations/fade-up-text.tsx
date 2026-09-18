"use client";

import { type ReactNode } from "react";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

interface FadeUpTextProps {
  text: ReactNode;
  className?: string;
  wordStagger?: number;
  duration?: number;
  delay?: number;
  y?: number;
}

export default function FadeUpText({
  text,
  className,
  wordStagger = 0.055,
  duration = 0.42,
  delay = 0,
  y = 8,
}: FadeUpTextProps) {
  const reduceMotion = useReducedMotion();
  const textValue =
    typeof text === "string" || typeof text === "number" ? String(text) : null;

  if (!textValue) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}
      </motion.div>
    );
  }

  const tokens = textValue.match(/\S+\s*/g) ?? [];

  if (reduceMotion) {
    return <p className={className}>{textValue}</p>;
  }

  return (
    <motion.p
      className={cn("w-fit", className)}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: wordStagger,
            delayChildren: delay,
          },
        },
      }}
    >
      {tokens.map((token, index) => (
        <motion.span
          key={`word-${index}`}
          className="whitespace-pre"
          style={{ display: "inline-block" }}
          variants={{
            hidden: { opacity: 0, y, filter: "blur(6px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {token}
        </motion.span>
      ))}
    </motion.p>
  );
}
