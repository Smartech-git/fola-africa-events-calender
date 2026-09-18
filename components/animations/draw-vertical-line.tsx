import React from "react";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}
export default function DrawVerticalLine({ className }: Props) {
  return (
    <div
      className={cn(
        "h-px w-px flex-none animate-grow-height bg-black/20",
        className,
      )}
    />
  );
}
