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
      labelPlacement="outside"
      validationBehavior="aria"
      {...props}
      classNames={{
        ...classNames,
        base: cn("w-full", classNames?.base),
        input: cn(
          "text-xs! uppercase! font-normal text-dark-gray! placeholder:text-dark-gray/45",
          classNames?.input,
        ),
        label: cn("text-xs! uppercase text-dark-gray!", classNames?.label),
        inputWrapper: cn(
          "h-[46px] min-h-[46px] rounded-none border border-light-gray bg-transparent! px-3 shadow-none",
          "data-[hover=true]:border-primary group-data-[focus=true]:border-primary group-data-[invalid=true]:border-danger",
          classNames?.inputWrapper,
        ),
        description: cn("text-xs uppercase text-dark-gray/75", classNames?.description),
        errorMessage: cn("text-xs uppercase text-danger", classNames?.errorMessage),
      }}
    />
  ),
);
Input.displayName = "Input";
export default Input;
