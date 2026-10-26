"use client";

import type { ReactNode } from "react";

import Link from "next/link";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import Contact from "@/components/footer/contact";
import Logo from "@/components/header/logo";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { SITE_NAME } from "@/constants/brand";
import { NAV } from "@/constants/nav";
import { socials } from "@/constants/socials";
import { useIsPathActive } from "@/hooks/use-is-path-active";
import { cn } from "@/lib/utils";

const instagram = socials.find((social) => social.name === "Instagram");

const linkClass =
  "font-montreal text-lg tracking-cou text-mono normal-case hover:text-cream";

const captionClass =
  "font-courier text-xs tracking-cou text-white/60 uppercase";

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <h2 className={captionClass}>{title}</h2>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

export default function Footer() {
  const { isPathActive } = useIsPathActive();

  return (
    <footer className="mt-auto w-full bg-ink text-white">
      <SectionWrapper className="gap-12 sm:gap-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex max-w-140 flex-col gap-5.5">
            <Logo variant="white" className="w-75 sm:w-115" />
            <FadeUpText
              as="p"
              className="tracking-mon font-montreal text-2xl sm:text-[40px]"
              text="Where Africa’s people, ideas and events meet."
            />
          </div>
          <Link href="/submit-event" className="w-full sm:w-fit">
            <Button className="max-sm:w-full" variant="solid" size="md">
              <HoverText text="Put it on Happenings" />
            </Button>
          </Link>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-16 gap-y-8 whitespace-nowrap"
        >
          <FooterColumn title="Explore">
            {NAV.filter((item) => !item.isFooter).map((item) => {
              const active = isPathActive(item.pathId);
              return (
                <li key={item.pathId}>
                  <Link
                    href={item.link}
                    aria-current={active ? "page" : undefined}
                    className="w-fit"
                  >
                    <Button
                      variant="flat"
                      size="fit"
                      className={linkClass}
                      startContent={
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-1.5 shrink-0 rounded-full bg-current",
                            active
                              ? "animate-fade animate-duration-500"
                              : "hidden",
                          )}
                        />
                      }
                    >
                      <HoverText text={item.title} />
                    </Button>
                  </Link>
                </li>
              );
            })}
          </FooterColumn>
          <FooterColumn title="Get in touch">
            <li>
              <Contact className={linkClass} />
            </li>
          </FooterColumn>
          <FooterColumn title="Follow">
            {instagram && (
              <li>
                <Link
                  href={instagram.link}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram (opens in a new tab)"
                  className="w-fit"
                >
                  <Button variant="flat" size="fit" className={linkClass}>
                    <HoverText text="Instagram" />
                  </Button>
                </Link>
              </li>
            )}
          </FooterColumn>
        </nav>

        <div className="flex flex-col gap-3 border-t border-white/25 pt-10">
          <Logo type="symbol" />
        </div>

        <div className="flex flex-col justify-between gap-1 border-t border-white/25 pt-5 font-courier text-xs tracking-cou text-white/60 uppercase sm:flex-row">
          <p>FOLA Projects</p>
          <p>
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
        </div>
      </SectionWrapper>
    </footer>
  );
}
