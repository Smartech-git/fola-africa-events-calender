"use client";

import React from "react";

import Link from "next/link";

import HoverText from "@/components/animations/hover-text";
import Button, { ButtonProps } from "@/components/ui/button";
import { useAccount } from "@/hooks/use-account";
import { cn } from "@/lib/utils";

interface Props extends ButtonProps {
  className?: string;
  accountVariant?: ButtonProps["variant"];
}

export default function SignIn({
  className,
  variant = "flat",
  size = "fit",
  accountVariant = "ink",
}: Props) {
  const { signedIn } = useAccount();

  // Distinct keys remount the button: HoverText splits its text once, on mount.
  if (signedIn)
    return (
      <Link key="account" href="/account" className="has-[.hidden]:hidden">
        <Button
          className={className}
          variant={accountVariant}
          size={size === "fit" ? "sm" : size}
        >
          <HoverText text="My account" />
        </Button>
      </Link>
    );

  return (
    <Link key="sign-in" href="/sign-in" className="has-[.hidden]:hidden">
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
