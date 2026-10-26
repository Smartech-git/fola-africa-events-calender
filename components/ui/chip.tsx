"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import type { VariantProps } from "class-variance-authority";

import { chipVariants } from "@/components/ui/chip-variants";
import { cn } from "@/lib/utils";

export interface ChipProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  /** Toggle chips: renders the active style and sets aria-pressed. */
  isSelected?: boolean;
}

const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, isSelected, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={isSelected}
      className={cn(
        chipVariants({ variant: isSelected ? "active" : variant }),
        className,
      )}
      {...props}
    />
  ),
);
Chip.displayName = "Chip";

/** Chip classes for elements that are not buttons, such as links. */
export { chipVariants };

export default Chip;
