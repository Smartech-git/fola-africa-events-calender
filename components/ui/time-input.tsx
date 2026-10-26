"use client";

import { forwardRef } from "react";

import {
  TimeInput as HeroUITimeInput,
  type TimeInputProps,
} from "@heroui/react";

import { cn } from "@/lib/utils";

const TimeInput = forwardRef<HTMLDivElement, TimeInputProps>(
  // 12-hour with an AM/PM segment by default; pass hourCycle={24} to opt out.
  ({ classNames, hourCycle = 12, ...props }, ref) => (
    <HeroUITimeInput
      ref={ref}
      variant="bordered"
      radius="none"
      labelPlacement="outside-top"
      validationBehavior="aria"
      hourCycle={hourCycle}
      {...props}
      classNames={{
        ...classNames,
        base: cn("w-full", classNames?.base),
        label: cn(
          "font-courier text-sm! leading-[1.3] font-normal tracking-mono text-red! uppercase",
          "pb-2",
          classNames?.label,
        ),
        inputWrapper: cn(
          "h-14 min-h-14",
          "rounded-none border border-ink bg-white! px-4 shadow-none data-[hover=true]:border-red group-data-[focus=true]:border-red group-data-[invalid=true]:border-red",
          classNames?.inputWrapper,
        ),
        segment: cn(
          "rounded-none font-montreal text-base text-ink data-[placeholder=true]:text-ink/40 focus:bg-cream focus:text-red sm:text-lg",
          classNames?.segment,
        ),
        helperWrapper: cn("px-0 pt-2", classNames?.helperWrapper),
        description: cn(
          "font-courier text-xs leading-5 tracking-mono text-ink/70 uppercase",
          classNames?.description,
        ),
        errorMessage: cn(
          "font-courier text-xs leading-5 tracking-mono text-red uppercase",
          classNames?.errorMessage,
        ),
      }}
    />
  ),
);
TimeInput.displayName = "TimeInput";
export default TimeInput;
