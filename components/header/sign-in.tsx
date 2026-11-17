"use client";

import React from "react";

import Link from "next/link";

import { ChevronDown } from "lucide-react";

import { signOut } from "@/actions/member-auth";
import HoverText from "@/components/animations/hover-text";
import Button, { ButtonProps } from "@/components/ui/button";
import {
  Dropdown,
  DropdownItem_,
  DropdownMenu,
  DropdownTrigger,
} from "@/components/ui/drop-down";
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

  if (signedIn)
    return (
      <Dropdown key="account" placement="bottom-end">
        <DropdownTrigger asChild>
          <Button
            className={className}
            variant={accountVariant}
            size={size === "fit" ? "sm" : size}
            endContent={<ChevronDown size={14} aria-hidden="true" />}
          >
            <HoverText text="My account" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Account"
          onAction={(key) => {
            if (key === "sign-out") void signOut();
          }}
        >
          <DropdownItem_ key="profile" as={Link} href="/account">
            My profile
          </DropdownItem_>
          <DropdownItem_ key="sign-out">Sign out</DropdownItem_>
        </DropdownMenu>
      </Dropdown>
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
