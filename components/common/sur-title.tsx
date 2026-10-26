import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  content?: ReactNode;
  as?: "span" | "p" | "h1" | "h2" | "h3";
  id?: string;
  dot?: boolean;
}

export default function SurTitle({
  className,
  content,
  as: Tag = "span",
  id,
  dot = false,
}: Props) {
  return (
    <Tag
      id={id}
      className={cn(
        "flex items-center font-courier text-sm tracking-cou text-red uppercase",
        dot && "flex w-fit items-center gap-2.5",
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 animate-fade rounded-full bg-current animate-duration-500"
        />
      )}
      {content}
    </Tag>
  );
}
