import { cva } from "class-variance-authority";

// Figma: Components — HOA / Chip. Pill-shaped Courier Prime caps.
// Kept out of chip.tsx (a client module) so server components can use the classes.
export const chipVariants = cva(
  "inline-flex w-fit cursor-pointer items-center justify-center rounded-full border px-4 py-2.5 font-courier text-sm tracking-cou whitespace-nowrap uppercase transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        /** Chip / Default */
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
