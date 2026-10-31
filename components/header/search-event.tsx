"use client";

import { useState } from "react";

import { usePathname } from "next/navigation";

import { Search } from "lucide-react";

import SearchPanel from "@/components/header/search-panel";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import Drawer from "@/components/ui/drawer";
import { DEFAULT_CITY_SLUG } from "@/constants/nav";
import { cn } from "@/lib/utils";

const belowHeader = "top-sm-header sm:top-header";

const motionProps = {
  initial: { y: "-100%" },
  animate: { y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { y: "-100%", transition: { duration: 0.3, ease: "easeIn" } },
} as const;

interface Props {
  /** The visitor's chosen city, searched outside a city calendar. */
  siteCity?: string;
  className?: string;
}

export default function SearchEvent({ siteCity, className }: Props) {
  const pathname = usePathname();
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const isOpen = openedOn === pathname;
  const setOpen = (open: boolean) => setOpenedOn(open ? pathname : null);

  // A city calendar searches its own city.
  const pageCity = pathname.startsWith("/calendar/")
    ? decodeURIComponent(pathname.split("/")[2] ?? "")
    : "";
  const city = pageCity || siteCity || DEFAULT_CITY_SLUG;

  return (
    <Drawer.Root isOpen={isOpen} onOpenChange={setOpen}>
      <Button
        variant="flat"
        size="fit"
        aria-label="Search happenings"
        aria-expanded={isOpen}
        onPress={() => setOpen(true)}
        className={cn(
          "text-inherit",
          isOpen && "pointer-events-none",
          className,
        )}
      >
        <Search size={18} aria-hidden="true" />
      </Button>
      <Drawer.Content
        aria-label="Search happenings"
        placement="top"
        motionProps={motionProps}
        className="h-auto max-h-full min-h-0 bg-cream text-ink shadow-none"
        classNames={{
          wrapper: cn(
            "z-99 h-[calc(100dvh-var(--spacing-sm-header))] overflow-hidden sm:h-[calc(100dvh-var(--spacing-header))]",
            belowHeader,
          ),
          backdrop: cn("z-99 bg-ink/40", belowHeader),
        }}
      >
        {(onClose) => (
          <Drawer.Body
            data-lenis-prevent
            className="overflow-y-auto px-0! py-0"
          >
            <SectionWrapper>
              <SearchPanel city={city} onClose={onClose} />
            </SectionWrapper>
          </Drawer.Body>
        )}
      </Drawer.Content>
    </Drawer.Root>
  );
}
