import React from "react";

import Link from "next/link";

import { Search } from "lucide-react";

import Button, { ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props extends ButtonProps {
  className?: string;
}
export default function SearchEvent({
  className,
  variant = "flat",
  size = "fit",
  ...rest
}: Props) {
  return (
    <Link href="/submit-event" className={"has-[.hidden]:hidden"}>
      <Button
        className={cn("text-inherit", className)}
        variant={variant}
        size={size}
        {...rest}
      >
        <Search size={18} />
      </Button>
    </Link>
  );
}
