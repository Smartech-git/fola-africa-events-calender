"use client";

import {
  Dropdown as HeroUIDropdown,
  DropdownTrigger as HeroUIDropdownTrigger,
  DropdownMenu as HeroUIDropdownMenu,
  DropdownItem as DropdownItem_,
  DropdownSection,
  type DropdownProps,
  type DropdownTriggerProps,
  type DropdownMenuProps,
} from "@heroui/react";

import Button, { type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Dropdown = ({
  placement = "bottom-start",
  classNames,
  ...props
}: DropdownProps) => (
  <HeroUIDropdown
    placement={placement}
    {...props}
    classNames={{
      ...classNames,
      base: cn("z-[110]", classNames?.base),
      content: cn(
        "max-w-[calc(100vw-2rem)]",
        "rounded-none border border-ink bg-white p-0 text-ink shadow-none",
        classNames?.content,
      ),
    }}
  />
);

interface DropdownTriggerPropsExtended
  extends DropdownTriggerProps, ButtonProps {
  asChild?: boolean;
  buttonClassName?: string;
}

const DropdownTrigger = ({
  asChild = false,
  variant = "bordered",
  size = "md",
  className,
  buttonClassName,
  children,
  ...props
}: DropdownTriggerPropsExtended) => {
  if (asChild) {
    return (
      <HeroUIDropdownTrigger className={className} {...props}>
        {children}
      </HeroUIDropdownTrigger>
    );
  }

  return (
    <HeroUIDropdownTrigger>
      <Button
        variant={variant}
        size={size}
        disableAnimation={true}
        {...props}
        className={cn(
          // Variant "bordered" renders as a select-style field (Figma Field / Select).
          variant === "bordered" &&
            "h-14 w-full justify-between border border-ink bg-white px-4 text-left font-montreal text-base tracking-normal normal-case hover:border-red hover:bg-white hover:text-ink sm:text-lg",
          className,
          buttonClassName,
        )}
      >
        {children}
      </Button>
    </HeroUIDropdownTrigger>
  );
};

const DropdownMenu = ({
  classNames,
  itemClasses,
  variant = "flat",
  ...props
}: DropdownMenuProps) => (
  <HeroUIDropdownMenu
    variant={variant}
    {...props}
    classNames={{
      ...classNames,
      base: cn("max-h-72 min-w-52 overflow-y-auto p-0", classNames?.base),
    }}
    itemClasses={{
      ...itemClasses,
      base: cn(
        "min-h-11 cursor-pointer rounded-none px-4 py-2.5 text-ink data-[hover=true]:bg-cream! data-[hover=true]:text-red data-[focus=true]:bg-cream! data-[selectable=true]:focus:bg-cream data-[selected=true]:text-red data-[focus-visible=true]:outline-red",
        itemClasses?.base,
      ),
      title: cn(
        "font-courier text-xs font-normal tracking-mono uppercase",
        itemClasses?.title,
      ),
      selectedIcon: cn("text-red", itemClasses?.selectedIcon),
    }}
  />
);

// Keep HeroUI's collection components intact; styling belongs on the menu.
export {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem_,
  DropdownSection,
};
