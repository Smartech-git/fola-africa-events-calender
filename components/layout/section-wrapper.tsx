import React, { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function SectionWrapper({
  children,
  className,
  ...props
}: Props) {
  return (
    <div
      {...props}
      className={cn(
        "relative flex w-full flex-col bg-transparent px-pg-sm py-4 sm:px-pg sm:py-8 2xl:px-pg-2xl 4k:px-pg-4k",
        className,
      )}
    >
      {children}
    </div>
  );
}
