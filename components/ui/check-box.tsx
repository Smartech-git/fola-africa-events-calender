"use client";

import { forwardRef } from "react";

import { Checkbox as HeroUICheckbox, type CheckboxProps } from "@heroui/react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ classNames, ...props }, ref) => (
    <HeroUICheckbox
      ref={ref}
      radius="none"
      // A function, so HeroUI's state props (isSelected…) never reach the <svg>.
      icon={({ className }) => <Check strokeWidth={2} className={className} />}
      {...props}
      classNames={{
        ...classNames,
        base: cn("max-w-full items-start gap-3 py-2", classNames?.base),
        wrapper: cn(
          "mt-0.5 shrink-0 rounded-none bg-white before:rounded-none before:border before:border-ink after:rounded-none after:bg-red group-data-[invalid=true]:before:border-red group-data-[focus-visible=true]:ring-red",
          classNames?.wrapper,
        ),
        icon: cn("text-white", classNames?.icon),
        label: cn(
          "w-full [&_a]:relative [&_a]:z-10 font-courier text-xs leading-5 font-normal tracking-mono text-ink uppercase",
          classNames?.label,
        ),
      }}
    />
  ),
);
Checkbox.displayName = "Checkbox";
export default Checkbox;
