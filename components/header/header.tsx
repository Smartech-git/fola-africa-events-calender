"use client";

import HoverText from "@/components/animations/hover-text";
import Logo from "@/components/header/logo";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  isLight?: boolean;
  hideLogo?: boolean;
}

export default function Header({ className, isLight }: Props) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-sm-header w-full flex-none grid-cols-3 items-center justify-between bg-primary-light px-pg-sm sm:h-header sm:px-pg lg:grid-cols-5 2xl:px-pg-2xl 4k:px-pg-4k",
        className,
      )}
    >
      <Logo
        isLight={isLight}
        wrapperClassName="justify-self-center border-black/20"
      />
      <Button variant="flat" size="fit">
        <HoverText text="Log in" />
      </Button>
    </header>
  );
}
