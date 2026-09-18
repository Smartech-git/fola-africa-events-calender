"use client";

import Link from "next/link";

import Button from "@/components/ui/button";
import { Nav } from "@/constants/nav";
import { useIsPathActive } from "@/hooks/use-is-path-active";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  nav: Nav[];
}
export default function HeaderNav({ className, nav }: Props) {
  const { isPathActive } = useIsPathActive();

  return (
    <div className={cn("flex w-full flex-col gap-4 font-inter", className)}>
      <div className="flex flex-col">
        {nav.map((item) =>
          item?.isMultiple ? (
            item.paths
              .filter((item) => !item.isMultiple)
              .map((subItem) => (
                <Link
                  key={subItem.pathId}
                  className="group w-full"
                  href={subItem.link}
                >
                  <Button
                    className="w-full justify-between border-b border-black/20 px-4 py-6 text-sm sm:text-base"
                    size="fit"
                    variant="link"
                    endContent={
                      <div className="size-3 rounded-full bg-secondary group-not-first:hidden" />
                    }
                    disableAnimation={true}
                  >
                    <span
                      className={cn(
                        isPathActive(subItem.pathId) && "underline",
                      )}
                    >
                      {subItem.title}
                    </span>
                  </Button>
                </Link>
              ))
          ) : (
            <Link key={item.pathId} className="group w-full" href={item.link}>
              <Button
                className="m:text-base w-full justify-between border-b border-black/20 px-4 py-6 text-sm"
                size="fit"
                variant="link"
                endContent={
                  <div className="size-3 rounded-full bg-secondary group-not-first:hidden" />
                }
                disableAnimation={true}
              >
                <span className={cn(isPathActive(item.pathId) && "underline")}>
                  {item.title}
                </span>
              </Button>
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
