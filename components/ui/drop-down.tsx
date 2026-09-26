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
        "max-w-[calc(100vw-2rem)] rounded-none border border-light-gray bg-primary-light p-1 font-inter text-dark-gray shadow-sm",
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
          "h-[46px] w-full justify-between rounded-none border-light-gray px-3 text-left text-sm font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
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
        "min-h-7 cursor-pointer rounded-none px-2 py-2 text-dark-gray data-[hover=true]:bg-secondary data-[hover=true]:text-primary data-[selectable=true]:focus:bg-secondary data-[selected=true]:text-primary data-[focus-visible=true]:outline-primary",
        itemClasses?.base,
      ),
      title: cn("font-inter text-xs font-normal uppercase", itemClasses?.title),
      selectedIcon: cn("text-primary", itemClasses?.selectedIcon),
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
