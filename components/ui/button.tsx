"use client";

import React, { forwardRef } from "react";

import { useButton, Ripple, PressEvent } from "@heroui/react";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const button = cva(
  "group relative flex w-fit flex-none cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-none font-courier text-sm  leading-none font-normal tracking-cou text-nowrap whitespace-nowrap uppercase transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-red data-[pressed=true]:scale-[0.97]",
  {
    variants: {
      variant: {
        solid: "bg-red text-white hover:bg-red/90",
        ink: "bg-ink text-white hover:bg-ink/90",
        bordered:
          "border border-ink bg-transparent text-ink",
        onWhite: "bg-white text-red",
        outlineWhite:
          "border border-white bg-transparent text-white hover:bg-white hover:text-red",
        flat: "bg-transparent text-ink",
        link: "border-b border-current bg-transparent text-ink hover:text-red",
        light: "text-black",
      },
      size: {
        icon: "size-[32px] sm:size-[38px]",
        xs: "h-[28px] px-3 text-xs",
        sm: "h-[38px] px-5",
        md: "h-[48px] px-7",
        lg: "h-15 px-8",
        fit: "h-fit min-h-fit p-0",
      },
      disabled: {
        false: null,
        true: "pointer-events-none opacity-50",
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
      // Not DOM attributes; keep them off the rendered <button>.
      isFollowCursorLight: _isFollowCursorLight,
      disableAnimation: _disableAnimation,
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
              "absolute -top-2 -right-2 z-40 flex h-5 min-w-5 animate-jump-in items-center justify-center rounded-full border border-white bg-ink text-xs font-bold text-white",
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
