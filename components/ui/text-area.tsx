"use client";

import { forwardRef } from "react";

import { Textarea as HeroUITextarea, type TextAreaProps } from "@heroui/react";

import { cn } from "@/lib/utils";

const Textarea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ classNames, variant = "bordered", ...props }, ref) => (
    <HeroUITextarea
      ref={ref}
      variant={variant}
      radius="none"
      labelPlacement="outside-top"
      validationBehavior="aria"
      minRows={4}
      {...props}
      classNames={{
        ...classNames,
        base: cn("min-w-0 w-full", classNames?.base),
        input: cn(
          "font-montreal text-base! leading-normal font-normal normal-case text-ink! placeholder:text-ink/40 sm:text-lg!",
          classNames?.input,
        ),
        label: cn(
          "font-courier text-sm! leading-[1.3] font-normal tracking-mono text-red! uppercase",
          "pb-2",
          classNames?.label,
        ),
        inputWrapper: cn(
          "min-h-35 items-start py-3.5",
          "rounded-none border border-ink bg-white! px-4 shadow-none data-[hover=true]:border-red group-data-[focus=true]:border-red group-data-[invalid=true]:border-red",
          classNames?.inputWrapper,
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

Textarea.displayName = "Textarea";
export default Textarea;
