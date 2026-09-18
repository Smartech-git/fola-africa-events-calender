"use client";

import Link from "next/link";

import Logo from "@/components/header/logo";
import MobileMenu from "@/components/header/mobile-menu";
import Button from "@/components/ui/button";
import { NAV } from "@/constants/nav";
import { useIsPathActive } from "@/hooks/use-is-path-active";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  isLight?: boolean;
  hideLogo?: boolean;
}

export default function Header({
  className,
  isLight,
  hideLogo = false,
}: Props) {
  const { isPathActive } = useIsPathActive();

  const shouldFixNav = isPathActive(["services", "studio-fola"]);

  return (
    <div
      className={cn(
        "sticky top-0 z-50 grid h-sm-header w-full flex-none grid-cols-3 items-center border-b border-black/20 bg-primary-light px-pg-sm sm:h-header sm:px-pg lg:grid-cols-5 2xl:px-pg-2xl 4k:px-pg-4k",
        className,
      )}
    >
      <VerticalDividers />

      <MobileMenu
        triggerClassName="lg:hidden justify-self-center"
        isLight={isLight}
        nav={NAV}
      />

      {NAV.filter((_, idx) => idx < 2).map((item) =>
        !item.isMultiple ? (
          <Nav
            className="max-lg:hidden"
            key={item.pathId}
            name={item.title}
            link={item.link}
            id={item.pathId}
          />
        ) : null,
      )}

      {!hideLogo ? (
        <Logo
          isLight={isLight}
          wrapperClassName="justify-self-center border-black/20"
        />
      ) : (
        <Logo
          isLight={isLight}
          useLogo
          wrapperClassName="justify-self-center border-black/20"
        />
      )}

      {NAV.filter((_i, idx) => idx >= 2).map((item, idx) =>
        item.isMultiple ? (
          <div
            className={cn(
              "group flex h-full w-full items-center justify-center gap-4 px-1",
              idx === 0 && "max-lg:hidden",
            )}
            key={`multiple-nav-${item.title}`}
          >
            <Nav
              className={cn("group-hover:hidden", shouldFixNav && "hidden!")}
              name={item.title}
              link=""
              asChild
            />
            {item?.paths
              .filter((item) => !item.isMultiple)
              .map((subItem) => (
                <Nav
                  className={cn(
                    "hidden group-hover:flex",
                    shouldFixNav && "flex!",
                  )}
                  key={subItem.pathId}
                  name={subItem.title}
                  link={subItem.link}
                  id={subItem.pathId}
                />
              ))}
          </div>
        ) : (
          <Nav
            className={cn("", idx === 0 && "max-lg:hidden")}
            key={item.pathId}
            id={item.pathId}
            name={item.title}
            link={item.link}
          />
        ),
      )}
    </div>
  );
}

interface NavProps {
  link: string;
  name: string;
  id?: string;
  className?: string;
  asChild?: boolean;
}
export const Nav = ({
  link,
  name,
  className,
  id,
  asChild = false,
}: NavProps) => {
  const { isPathActive } = useIsPathActive();

  const Comp = (
    <Button
      className={cn(
        "text-xs font-normal sm:text-sm",
        isPathActive(id) && !asChild && "underline",
        asChild && className,
      )}
      size="fit"
      variant="link"
    >
      {name}
    </Button>
  );

  if (asChild) {
    return Comp;
  }

  return (
    <Link className={cn("w-fit justify-self-center", className)} href={link}>
      {Comp}
    </Link>
  );
};

const VerticalDividers = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 grid grid-cols-3 px-pg-sm sm:px-pg lg:grid-cols-5 2xl:px-pg-2xl 4k:px-pg-4k"
    >
      <span className="border-x border-black/20" />
      <span className="hidden border-r border-black/20 lg:block" />
      <span className="border-r border-black/20" />
      <span className="hidden border-r border-black/20 lg:block" />
      <span className="border-r border-black/20" />
    </div>
  );
};
