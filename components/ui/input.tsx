"use client";

import { forwardRef } from "react";

import { Input as HeroUIInput, type InputProps } from "@heroui/react";

import { cn } from "@/lib/utils";

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ classNames, variant = "bordered", ...props }, ref) => (
    <HeroUIInput
      ref={ref}
      variant={variant}
      radius="none"
      labelPlacement="outside-top"
      validationBehavior="aria"
      {...props}
      classNames={{
        ...classNames,
        base: cn("w-full", classNames?.base),
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
          "h-14 min-h-14",
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
Input.displayName = "Input";
export default Input;
