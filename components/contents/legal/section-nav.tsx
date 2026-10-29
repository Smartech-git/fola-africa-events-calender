"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import HoverText from "@/components/animations/hover-text";
import DateCircle from "@/components/ui/date-circle";
import { cn } from "@/lib/utils";

interface Props {
  htmlString: string;
  title?: string;
}

const number = (index: number) => String(index + 1).padStart(2, "0");

/**
 * Desktop: sticky list of the document's sections, read from its h2s. The
 * circle fills for the section in view, as on the submission form.
 */
export default function SectionNav({ htmlString, title = "Sections" }: Props) {
  const sections = useMemo(
    () =>
      Array.from(
        htmlString.matchAll(/<h2\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi),
      ).map(([, id, heading]) => ({
        id,
        // The circle carries the number, so drop "1. " from the heading.
        title: heading
          .replace(/<[^>]*>/g, "")
          .replace(/^\s*\d+\.\s*/, "")
          .trim(),
      })),
    [htmlString],
  );
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      // A heading counts as current once it crosses the upper middle of the screen.
      { rootMargin: "-35% 0px -60% 0px" },
    );
    for (const { id } of sections) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [sections]);

  if (!sections.length) return null;

  return (
    <nav
      aria-label="Document sections"
      className="sticky top-28 flex w-72 shrink-0 flex-col gap-3 max-lg:hidden xl:w-80"
    >
      <span className="font-courier text-sm tracking-cou text-red uppercase">
        {title}
      </span>
      <ol className="flex flex-col">
        {sections.map((section, index) => {
          const current = section.id === active;
          return (
            <li key={section.id} className="border-b border-ink/20">
              <Link
                href={`#${section.id}`}
                aria-current={current ? "location" : undefined}
                onClick={() => setActive(section.id)}
                className="flex items-center gap-3.5 py-3.5 focus-visible:outline-2 focus-visible:outline-red"
              >
                <DateCircle
                  size="sm"
                  variant={current ? "filled" : "outline"}
                  className="transition-colors"
                >
                  {number(index)}
                </DateCircle>
                <HoverText
                  text={section.title}
                  className={cn(
                    "font-courier text-sm tracking-cou uppercase",
                    current ? "text-red" : "text-ink",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
