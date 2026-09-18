"use client";

import { ReactNode } from "react";

import {
  Accordion as HeroUIAccordion,
  AccordionItem as HeroUIAccordionItem,
  type AccordionProps,
} from "@heroui/react";

import { cn } from "@/lib/utils";

export type AccordionItems = {
  key: string | number;
  title: ReactNode;
  content: ReactNode;
}[];

interface ReusableAccordionProps extends Omit<AccordionProps, "children"> {
  items: AccordionItems;
}

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
        base: itemClasses?.base,
        content: ["gap-4", ...(itemClasses?.content || [])],
        trigger: [
          "my-0 p-4 group sm:p-6 rounded-lg",
          ...(itemClasses?.trigger || []),
        ],
        indicator: [
          "[&_svg]:size-5 text-neutral-500",
          ...(itemClasses?.indicator || []),
        ],
        title: itemClasses?.title,
      }}
      showDivider={false}
      {...props}
    >
      {items.map((item) => (
        <HeroUIAccordionItem
          key={item.key}
          aria-label={`Accordion item ${item.key}`}
          title={item.title}
          classNames={{

          }}
        >
          {item.content}
        </HeroUIAccordionItem>
      ))}
    </HeroUIAccordion>
  );
};
