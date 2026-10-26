import React from "react";

import Link from "next/link";

import HoverText from "@/components/animations/hover-text";
import Button, { ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props extends ButtonProps {
  className?: string;
}
export default function SubmitEvent({
  className,
  variant = "onWhite",
  ...rest
}: Props) {
  return (
    <Link href="/submit-event" className={"has-[.hidden]:hidden"}>
      <Button className={cn(className)} variant={variant} {...rest}>
        <HoverText text="Submit a happening" />
      </Button>
    </Link>
  );
}
