import type { ReactNode } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const circle = cva(
  "inline-flex shrink-0 sm:pt-1 pt-0.5 items-center justify-center rounded-full border-[1.5px] font-courier leading-[1.2] tracking-mono uppercase",
  {
    variants: {
      variant: {
        outline: "border-red bg-transparent text-red",
        filled: "border-red bg-red text-white",
        white: "border-white bg-white text-red",
        outlineWhite: "border-white bg-transparent text-white",
      },
      size: {
        md: "size-12 text-lg",
        sm: "size-10 text-sm",
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

interface Props extends VariantProps<typeof circle> {
  children: ReactNode;
  className?: string;
}

export default function DateCircle({
  children,
  variant,
  size,
  className,
}: Props) {
  return (
    <span className={cn(circle({ variant, size }), className)}>{children}</span>
  );
}
