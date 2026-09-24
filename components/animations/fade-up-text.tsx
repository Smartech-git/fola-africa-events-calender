"use client";

import {
  Fragment,
  type ReactNode,
  type RefObject,
  useLayoutEffect,
  useRef,
} from "react";

import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

import { cn } from "@/lib/utils";

gsap.registerPlugin(SplitText);

interface FadeUpTextProps {
  id?: string;
  /** String newlines and JSX <br /> elements create explicit line breaks. */
  text: ReactNode;
  as?: "p" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  inView?: boolean;
  once?: boolean;
  amount?: number;
  viewportRef?: RefObject<HTMLElement | null>;
  lineStagger?: number;
  duration?: number;
  delay?: number;
  y?: number;
}

export default function FadeUpText({
  id,
  text,
  as,
  className,
  inView = true,
  once = false,
  amount = 0.6,
  viewportRef,
  lineStagger,
  duration = 1.2,
  delay = 0,
  y = 0,
}: FadeUpTextProps) {
  const textRef = useRef<HTMLElement | null>(null);
  const stagger = lineStagger ?? 0.1;
  const Tag =
    as ?? (typeof text === "string" || typeof text === "number" ? "p" : "div");

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      let cancelled = false;
      let split: SplitText | undefined;
      let animation: gsap.core.Tween | undefined;
      let observer: IntersectionObserver | undefined;
      let visible = !inView;
      const visibility = element.style.visibility;

      // Keep the layout in place while waiting for accurate font measurements.
      element.style.visibility = "hidden";

      if (inView && typeof IntersectionObserver !== "undefined") {
        const threshold = Math.min(1, Math.max(0, amount));
        observer = new IntersectionObserver(
          ([entry]) => {
            if (cancelled || !entry) return;

            visible =
              entry.isIntersecting && entry.intersectionRatio >= threshold;
            if (visible) {
              animation?.play();
              if (once) observer?.disconnect();
            } else if (!once) {
              animation?.reverse();
            }
          },
          { root: viewportRef?.current ?? null, threshold },
        );
        observer.observe(element);
      } else {
        visible = true;
      }

      void document.fonts.ready.then(() => {
        if (cancelled) return;

        split = SplitText.create(element, {
          type: "words,lines",
          mask: "lines",
          autoSplit: true,
          linesClass: "fade-up-text-line",
          onSplit(self) {
            element.style.visibility = visibility;

            // Returning the tween lets SplitText preserve progress on resize.
            animation = gsap.from(self.lines, {
              paused: true,
              yPercent: 100,
              y,
              opacity: 0,
              duration,
              delay,
              stagger,
              ease: "expo.out",
            });

            if (visible) animation.play();
            else animation.reverse();
            return animation;
          },
        });
      });

      return () => {
        cancelled = true;
        observer?.disconnect();
        split?.revert();
        element.style.visibility = visibility;
      };
    });

    return () => media.revert();
  }, [
    text,
    as,
    className,
    duration,
    delay,
    stagger,
    y,
    inView,
    once,
    amount,
    viewportRef,
  ]);

  return (
    <Tag
      id={id}
      ref={(element) => {
        textRef.current = element;
      }}
      className={cn("w-fit", className)}
    >
      {typeof text === "string"
        ? text.split(/\r\n|\r|\n/).map((line, index) => (
            <Fragment key={index}>
              {index > 0 && <br />}
              {line}
            </Fragment>
          ))
        : text}
    </Tag>
  );
}
