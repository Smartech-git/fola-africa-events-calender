"use client";

import { Fragment, type ReactNode, useLayoutEffect, useRef } from "react";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

import { cn } from "@/lib/utils";

gsap.registerPlugin(SplitText);

interface HoverTextProps {
  text: string;
  className?: string;
  lineStagger?: number;
  duration?: number;
  y?: number;
  ease?: string;
  endContent?: ReactNode;
}

export default function HoverText({
  text,
  className,
  lineStagger,
  duration = 0.3,
  y = 0,
  ease = "power3.out",
  endContent,
}: HoverTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const stagger = lineStagger ?? 0.1;

  useLayoutEffect(() => {
    const container = containerRef.current;
    const element = textRef.current;
    if (!container || !element) return;

    // Include the surrounding control's padding and keyboard focus, if present.
    const trigger =
      container.closest<HTMLElement>("a, button, [role='button']") ?? container;
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      let cancelled = false;
      let split: SplitText | undefined;
      let animation: gsap.core.Timeline | undefined;
      let hovered = trigger.matches(":hover");
      const hasKeyboardFocus = () =>
        trigger.matches(":focus-visible") ||
        trigger.querySelector(":focus-visible") !== null;
      let focused = hasKeyboardFocus();

      const updateDirection = () => {
        if (hovered || focused) animation?.play();
        else animation?.reverse();
      };
      const handleEnter = () => {
        hovered = true;
        updateDirection();
      };
      const handleLeave = () => {
        hovered = false;
        updateDirection();
      };
      const handleFocus = () => {
        focused = hasKeyboardFocus();
        updateDirection();
      };
      const handleBlur = (event: FocusEvent) => {
        focused =
          event.relatedTarget instanceof Element &&
          trigger.contains(event.relatedTarget) &&
          event.relatedTarget.matches(":focus-visible");
        updateDirection();
      };

      trigger.addEventListener("mouseenter", handleEnter);
      trigger.addEventListener("mouseleave", handleLeave);
      trigger.addEventListener("focusin", handleFocus);
      trigger.addEventListener("focusout", handleBlur);

      void document.fonts.ready.then(() => {
        if (cancelled) return;

        split = SplitText.create(element, {
          type: "words,lines",
          mask: "lines",
          autoSplit: true,
          linesClass: "hover-text-line",
          onSplit(self) {
            const copies = self.lines.map((line, index) => {
              const mask = self.masks[index] as HTMLElement;
              const copy = line.cloneNode(true) as HTMLElement;

              mask.style.position = "relative";
              copy.setAttribute("aria-hidden", "true");
              copy.style.position = "absolute";
              copy.style.inset = "0";
              mask.appendChild(copy);
              return copy;
            });

            animation = gsap
              .timeline({
                paused: true,
                defaults: { duration, stagger, ease },
              })
              .to(self.lines, { yPercent: -100, y: -y }, 0)
              .fromTo(copies, { yPercent: 100, y }, { yPercent: 0, y: 0 }, 0);

            updateDirection();
            return animation;
          },
        });
      });

      return () => {
        cancelled = true;
        trigger.removeEventListener("mouseenter", handleEnter);
        trigger.removeEventListener("mouseleave", handleLeave);
        trigger.removeEventListener("focusin", handleFocus);
        trigger.removeEventListener("focusout", handleBlur);
        split?.revert();
      };
    });

    return () => media.revert();
  }, [text, className, duration, stagger, y, ease]);

  return (
    <div
      ref={containerRef}
      className="flex w-fit max-w-full items-center gap-1 md:gap-2"
    >
      <div ref={textRef} className={cn("min-w-0", className)}>
        {text.split(/\r\n|\r|\n/).map((line, index) => (
          <Fragment key={index}>
            {index > 0 && <br />}
            {line}
          </Fragment>
        ))}
      </div>
      {endContent}
    </div>
  );
}
