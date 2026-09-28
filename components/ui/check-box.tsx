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
      icon={<Check strokeWidth={2} />}
      {...props}
      classNames={{
        ...classNames,
        base: cn("max-w-full items-start gap-2 py-2", classNames?.base),
        wrapper: cn(
          "mt-0.5 shrink-0 rounded-none before:rounded-none before:border before:border-light-gray after:rounded-none after:bg-dark-gray group-data-[focus-visible=true]:ring-primary",
          classNames?.wrapper,
        ),
        icon: cn("text-primary-light", classNames?.icon),
        label: cn(
          "text-xs w-full leading-5 font-normal text-dark-gray uppercase",
          classNames?.label,
        ),
      }}
    />
  ),
);
Checkbox.displayName = "Checkbox";
export default Checkbox;
