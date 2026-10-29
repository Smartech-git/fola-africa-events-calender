"use client";

import { ReactNode } from "react";

import {
  Accordion as HeroUIAccordion,
  AccordionItem as HeroUIAccordionItem,
  type AccordionProps,
} from "@heroui/react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type AccordionItems = {
  key: string | number;
  title: ReactNode;
  content: ReactNode;
  /** Accessible name when the title is not plain text. */
  ariaLabel?: string;
}[];

interface ReusableAccordionProps extends Omit<AccordionProps, "children"> {
  items: AccordionItems;
}

// Square and flat: Courier caps triggers over an ink rule, no rounded cards.
export const Accordion = ({
  items,
  itemClasses,
  className,
  ...props
}: ReusableAccordionProps) => {
  return (
    <HeroUIAccordion
      className={cn("px-0", className)}
      itemClasses={{
        ...itemClasses,
        base: cn("border-b border-ink/20", itemClasses?.base),
        trigger: cn(
          "group flex w-full items-center gap-3 rounded-none py-4 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-red",
          itemClasses?.trigger,
        ),
        title: cn(
          "font-courier text-sm tracking-cou text-ink uppercase",
          itemClasses?.title,
        ),
        // The chevron points down while closed and turns up once open.
        indicator: cn(
          "text-red transition-transform duration-300 data-[open=true]:rotate-180 rtl:data-[open=true]:rotate-180",
          itemClasses?.indicator,
        ),
        content: cn("pt-0 pb-4", itemClasses?.content),
      }}
      showDivider={false}
      {...props}
    >
      {items.map((item) => (
        <HeroUIAccordionItem
          key={item.key}
          aria-label={
            item.ariaLabel ??
            (typeof item.title === "string" ? item.title : String(item.key))
          }
          title={item.title}
          indicator={<ChevronDown size={18} aria-hidden="true" />}
        >
          {item.content}
        </HeroUIAccordionItem>
      ))}
    </HeroUIAccordion>
  );
};
