import React from "react";

import Link from "next/link";

import Button, { ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props extends ButtonProps {
  className?: string;
  buttonClassName?: string;
  isLight?: boolean;
  title?: string;
}
export default function ContactUs({
  className,
  isLight,
  title = "Contact us",
  buttonClassName,
  ...rest
}: Props) {
  return (
    <div className={cn("justify-self-end", className)}>
      <Link href="/contact">
        <Button
          isFollowCursorLight={isLight}
          variant="link"
          className={cn(
            "hover:text-none font-inter text-sm font-normal sm:text-sm",
            isLight && "text-primary-light",
            buttonClassName,
          )}
          size="fit" 
          {...rest}
        >
          {title}
        </Button>
      </Link>
    </div>
  );
}
