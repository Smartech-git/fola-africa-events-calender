import React from "react";

import Link from "next/link";

import HoverText from "@/components/animations/hover-text";
import Button, { ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props extends ButtonProps {
  className?: string;
}
export default function SignIn({
  className,
  variant = "flat",
  size = "fit",
}: Props) {
  return (
    <Link href="/sign-in" className={"has-[.hidden]:hidden"}>
      <Button
        className={cn("text-inherit", className)}
        variant={variant}
        size={size}
      >
        <HoverText text="Sign in" />
      </Button>
    </Link>
  );
}
