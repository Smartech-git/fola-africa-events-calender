import Image from "next/image";
import Link from "next/link";

import { SITE_NAME } from "@/constants/brand";
import { cn } from "@/lib/utils";

const WORDMARKS = {
  red: "/assets/brand/wordmark-red.svg",
  ink: "/assets/brand/wordmark-ink.svg",
  white: "/assets/brand/wordmark-white.svg",
} as const;

const SYMBOLS = {
  red: "/assets/brand/logo-red.svg",
  white: "/assets/brand/logo-white.svg",
} as const;

export type LogoVariant = keyof typeof WORDMARKS;

interface Props {
  className?: string;
  wrapperClassName?: string;
  variant?: LogoVariant;
  type?: "wordmark" | "symbol";
}

export default function Logo({
  className,
  wrapperClassName,
  variant,
  type = "wordmark",
}: Props) {
  if (type === "symbol")
    return (
      <Image
        src={SYMBOLS[variant === "red" ? "red" : "white"]}
        width={360}
        height={17}
        alt=""
        aria-hidden="true"
        className={cn("h-auto w-full", className)}
      />
    );

  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} home`}
      className={cn(
        "flex size-fit flex-none items-center outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current",
        wrapperClassName,
      )}
    >
      <Image
        src={WORDMARKS[variant ?? "red"]}
        width={360}
        height={27}
        alt={SITE_NAME}
        preload
        className={cn("h-auto w-50 sm:w-56", className)}
      />
    </Link>
  );
}
