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
      labelPlacement="outside"
      validationBehavior="aria"
      minRows={3}
      {...props}
      classNames={{
        ...classNames,
        base: cn("min-w-0 w-full font-inter", classNames?.base),
        input: cn(
          "text-xs! uppercase font-normal text-dark-gray! placeholder:text-dark-gray/45",
          classNames?.input,
        ),
        label: cn("text-xs! text-dark-gray! uppercase", classNames?.label),
        inputWrapper: cn(
          "items-start rounded-none border border-light-gray bg-transparent! px-3 py-3 shadow-none",
          "data-[hover=true]:border-primary group-data-[focus=true]:border-primary group-data-[invalid=true]:border-danger",
          classNames?.inputWrapper,
        ),
        description: cn(
          "text-xs leading-5 text-dark-gray/75 uppercase",
          classNames?.description,
        ),
        errorMessage: cn(
          "text-xs text-danger uppercase",
          classNames?.errorMessage,
        ),
      }}
    />
  ),
);

Textarea.displayName = "Textarea";
export default Textarea;
