"use client";

import Link from "next/link";

import HoverText from "@/components/animations/hover-text";
import Button from "@/components/ui/button";
import { NAV, type Nav } from "@/constants/nav";
import { useIsPathActive } from "@/hooks/use-is-path-active";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  linkClassName?: string;
  nav?: Nav[];
  onNavigate?: () => void;
}

export default function HeaderNav({
  className,
  linkClassName,
  nav = NAV,
  onNavigate,
}: Props) {
  const { isPathActive } = useIsPathActive();

  return (
    <nav aria-label="Main" className={cn("gap-6", className)}>
      <ul className="contents">
        {nav
          .filter((item) => !item?.isFooter)
          .map((item) => {
            const active = isPathActive(item.pathId);
            return (
              <li key={item.pathId} className="contents">
                <Link
                  href={item.link}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn("w-fit", linkClassName)}
                >
                  <Button
                    startContent={
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-2 shrink-0 rounded-full bg-current",
                          active
                            ? "animate-fade animate-duration-500"
                            : "hidden",
                        )}
                      />
                    }
                    className="text-inherit"
                    variant="flat"
                    size="fit"
                  >
                    <HoverText text={item.title} />
                  </Button>
                </Link>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}
