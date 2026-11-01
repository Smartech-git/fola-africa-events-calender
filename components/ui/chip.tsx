import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const chipVariants = cva(
  "inline-flex w-fit cursor-pointer items-center justify-center rounded-full border px-4 py-1.5 font-courier text-xs leading-none tracking-cou whitespace-nowrap uppercase transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red disabled:pointer-events-none disabled:opacity-50 sm:py-2 sm:text-sm",
  {
    variants: {
      variant: {
        default:
          "border-ink bg-transparent text-ink hover:border-red hover:text-red",
        active: "border-ink bg-ink text-white",
        red: "border-red bg-red text-white",
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
  (
    { className, variant, isSelected, type = "button", children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={isSelected}
      className={cn(
        chipVariants({ variant: isSelected ? "active" : variant }),
        className,
      )}
      {...props}
    >
      <span className="mt-0.5">{children}</span>
    </button>
  ),
);
Chip.displayName = "Chip";

export default Chip;
