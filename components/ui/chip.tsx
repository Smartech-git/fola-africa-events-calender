import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Figma: Components — HOA / Chip. Pill-shaped Courier Prime caps.
// No "use client": server components use chipVariants for links styled as chips.
export const chipVariants = cva(
  "inline-flex w-fit cursor-pointer leading-none items-center justify-center rounded-full border px-4 sm:py-2.5 py-2 font-courier sm:text-sm text-xs tracking-cou whitespace-nowrap uppercase transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-ink bg-transparent text-ink hover:border-red hover:text-red",
        /** Chip / Active */
        active: "border-ink bg-ink text-white",
        /** Chip / Red */
        red: "border-red bg-red text-white",
        /** Chip / On Red: for use on red surfaces. */
        onRed:
          "border-white bg-transparent text-white hover:bg-white hover:text-red",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface ChipProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
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

export default Chip;
