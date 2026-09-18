"use client";

import React, { forwardRef } from "react";

import { useButton, Ripple, PressEvent } from "@heroui/react";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";

// import FollowCursor from "@/components/ui/follow-cursor";
import { cn } from "@/lib/utils";

const button = cva(
  "group relative flex w-fit flex-none cursor-pointer items-center font-inter justify-center gap-2 overflow-hidden text-base font-normal text-nowrap whitespace-nowrap uppercase transition-all outline-none hover:opacity-100 data-[pressed=true]:scale-[0.97]",
  {
    variants: {
      variant: {
        solid:
          "data-[disabled=true]:border-border border border-white bg-white text-secondary hover:border-primary hover:bg-transparent hover:text-primary data-[disabled=true]:border-1.5 data-[disabled=true]:bg-gray-100! data-[disabled=true]:bg-none! data-[disabled=true]:text-gray-500 data-[disabled=true]:opacity-100!",
        bordered: "border border-primary bg-transparent text-primary",
        flat: "rounded-none! bg-transparent text-primary",
        link: "rounded-none! underline-offset-2 hover:text-primary hover:underline",
        light: "text-black",
      },
      size: {
        icon: "size-8",
        xs: "h-[36px] px-3",
        sm: "h-[40px] px-3 py-1.5",
        md: "h-[48px] px-4 py-2.5",
        lg: "h-[56px] px-6 py-2.5",
        fit: "p-0 pb-0",
      },
      disabled: {
        false: null,
        true: "opacity-60",
      },
    },

    defaultVariants: {
      variant: "solid",
      size: "md",
      disabled: false,
    },
  },
);

export interface ButtonProps
  extends
    VariantProps<typeof button>,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  spinnerSize?: "sm" | "md" | "lg";
  spinner?: React.ReactNode;
  spinnerPlacement?: "start" | "end";
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  isLoading?: boolean;
  disableRipple?: boolean;
  className?: string;
  disabled?: boolean;
  bubbleContent?: React.ReactNode;
  isFollowCursorLight?: boolean;
  disableAnimation?: boolean;
  bubbleClassName?: string;
  onPress?: (event: PressEvent) => void;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
      disabled,
      bubbleContent,
      bubbleClassName,
      isFollowCursorLight,
      ...props
    },
    ref,
  ) => {
    const {
      domRef,
      children,
      spinner = (
        <LoaderCircle className="size-5 animate-spin text-current animate-duration-500" />
      ),
      startContent,
      endContent,
      isLoading,
      disableRipple,
      getButtonProps,
      getRippleProps,
    } = useButton({
      ref,
      disableRipple: true,
      isDisabled: disabled,
      ...(props as any),
    });

    const { ripples, onClear } = getRippleProps();

    const comp = (
      <button
        ref={domRef}
        {...getButtonProps()}
        disabled={disabled}
        className={cn(button({ variant, size, disabled }), props.className)}
      >
        {startContent}
        {isLoading ? spinner : children}
        {endContent}
        {!disableRipple && <Ripple ripples={ripples} onClear={onClear} />}
      </button>
    );

    if (!bubbleContent) {
      return comp;
    }

    return (
      <div className="relative w-fit">
        {bubbleContent && (
          <div
            className={cn(
              "absolute -top-2 -right-2 z-40 flex h-5 min-w-5 animate-jump-in items-center justify-center rounded-full border border-white bg-red-500 text-xs font-bold text-white",
              bubbleClassName,
            )}
          >
            {bubbleContent}
          </div>
        )}
        {comp}
      </div>
    );
  },
);

Button.displayName = "MyButton";

export default Button;
