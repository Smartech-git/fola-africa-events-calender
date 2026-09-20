"use client";

import { Fragment, type ReactNode, useLayoutEffect, useRef } from "react";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

import { cn } from "@/lib/utils";

gsap.registerPlugin(SplitText);

interface HoverTextProps {
  text: string;
  className?: string;
  inView?: boolean;
  /** Delay in seconds for the initial in-view animation only. */
  delay?: number;
  lineStagger?: number;
  duration?: number;
  y?: number;
  ease?: string;
  endContent?: ReactNode;
}

export default function HoverText({
  text,
  className,
  inView = false,
  delay = 0,
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
      let observer: IntersectionObserver | undefined;
      let entranceAnimation: gsap.core.Tween | undefined;
      let hovered = trigger.matches(":hover");
      const hasKeyboardFocus = () =>
        trigger.matches(":focus-visible") ||
        trigger.querySelector(":focus-visible") !== null;
      let focused = hasKeyboardFocus();

      const updateDirection = () => {
        if (entranceAnimation) {
          if (!hovered && !focused) return;
          entranceAnimation.kill();
          entranceAnimation = undefined;
          // Interaction takes over immediately, including during the delay.
          animation?.restart();
          return;
        }
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
            entranceAnimation?.kill();
            entranceAnimation = undefined;
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

        if (inView && typeof IntersectionObserver !== "undefined") {
          observer = new IntersectionObserver(([entry]) => {
            if (cancelled || !entry?.isIntersecting) return;
            observer?.disconnect();
            // An active interaction already plays this same effect.
            if (hovered || focused || !animation) return;
            // Drive the paused timeline separately so hover never inherits delay
            // or completion callbacks from the entrance animation.
            animation.pause(0);
            entranceAnimation = gsap.to(animation, {
              progress: 1,
              duration: animation.duration(),
              delay: Math.max(0, delay),
              ease: "none",
              onComplete: () => {
                entranceAnimation = undefined;
                // Reset identical text copies so the next hover can play again.
                animation?.pause(0);
              },
            });
          });
          observer.observe(container);
        }
      });

      return () => {
        cancelled = true;
        observer?.disconnect();
        entranceAnimation?.kill();
        trigger.removeEventListener("mouseenter", handleEnter);
        trigger.removeEventListener("mouseleave", handleLeave);
        trigger.removeEventListener("focusin", handleFocus);
        trigger.removeEventListener("focusout", handleBlur);
        split?.revert();
      };
    });

    return () => media.revert();
  }, [text, className, duration, stagger, y, ease, inView, delay]);

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
