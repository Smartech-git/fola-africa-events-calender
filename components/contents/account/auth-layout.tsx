import type { ReactNode } from "react";

import Link from "next/link";

import DotField from "@/components/animations/dot-field";
import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import SectionWrapper from "@/components/layout/section-wrapper";
import { cn } from "@/lib/utils";

interface Props {
  /** The red panel's heading, in capitals (desktop only). */
  heading: string;
  intro?: string;
  /** Extra red-panel content under the intro, such as the Create Account list. */
  asideContent?: ReactNode;
  /** Create Account carries the dots at the foot of the panel; the rest at the top. */
  dotsAt?: "top" | "bottom";
  /** A wider form column, for Create Account. */
  wide?: boolean;
  children: ReactNode;
}

// Figma: Sign In, Create Account, Check Your Email and Continue to Happenings.
// Red panel on the left (desktop), the form on white to its right.
export default function AuthLayout({
  heading,
  intro,
  asideContent,
  dotsAt = "top",
  wide = false,
  children,
}: Props) {
  const dots = <DotField className="h-50 w-full" seed={3} />;

  return (
    <div
      className={cn(
        "grid w-full",
        wide ? "lg:grid-cols-[47fr_53fr]" : "lg:grid-cols-[55fr_45fr]",
      )}
    >
      <SectionWrapper className="justify-between gap-4 bg-red text-white max-lg:hidden lg:min-h-[calc(100dvh-var(--spacing-header))]">
        {dotsAt === "top" && dots}
        <div className="flex flex-col gap-6">
          <FadeUpText
            as="h2"
            text={heading}
            className="max-w-160 font-montreal text-7xl font-medium tracking-mono uppercase xl:text-8xl"
          />
          {intro && (
            <FadeUpText
              text={intro}
              delay={0.15}
              className="max-w-160 font-montreal text-xl text-cream xl:text-2xl"
            />
          )}
          {asideContent}
        </div>
        {dotsAt === "bottom" && dots}
      </SectionWrapper>
      <SectionWrapper className="lg:justify-center">
        <div
          className={cn(
            "flex w-full flex-col gap-6",
            wide ? "lg:max-w-150 xl:ml-[6%]" : "lg:max-w-104 xl:ml-[6%]",
          )}
        >
          {children}
        </div>
      </SectionWrapper>
    </div>
  );
}

export function AuthTitle({
  surTitle,
  title,
  intro,
}: {
  surTitle?: string;
  title: string;
  intro?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      {surTitle && (
        <span className="flex items-center gap-2.5 font-courier text-sm tracking-cou text-red uppercase">
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-full bg-red"
          />
          {surTitle}
        </span>
      )}
      <FadeUpText
        as="h1"
        text={title}
        className="font-montreal text-4xl font-medium tracking-mono sm:text-5xl"
      />
      {intro && <p className="font-montreal text-lg sm:text-2xl">{intro}</p>}
    </div>
  );
}

const TABS = [
  { id: "sign-in", label: "Sign in", href: "/sign-in" },
  { id: "create-account", label: "Create an account", href: "/create-account" },
] as const;

/** Sign In and Create an Account are two pages under one set of tabs. */
export function AuthTabs({
  active,
  next,
}: {
  active: (typeof TABS)[number]["id"];
  next?: string;
}) {
  return (
    <nav aria-label="Account" className="border-b border-ink">
      <ul className="flex gap-6">
        {TABS.map((tab) => {
          const current = tab.id === active;
          return (
            <li key={tab.id}>
              <Link
                href={
                  next
                    ? `${tab.href}?${new URLSearchParams({ next })}`
                    : tab.href
                }
                aria-current={current ? "page" : undefined}
                className={cn(
                  "-mb-px flex border-b-[3px] pb-3 font-courier text-sm tracking-cou uppercase transition-colors focus-visible:outline-2 focus-visible:outline-red",
                  current
                    ? "border-red text-red"
                    : "border-transparent hover:text-red",
                )}
              >
                <HoverText text={tab.label} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Courier caps line used for form notes and errors. */
export function AuthNote({
  children,
  tone = "muted",
  role,
  className,
}: {
  children: ReactNode;
  tone?: "muted" | "error";
  role?: "alert" | "status";
  className?: string;
}) {
  return (
    <p
      role={role}
      className={cn(
        "font-courier text-xs tracking-cou",
        tone === "error" ? "text-red uppercase" : "text-ink/70",
        className,
      )}
    >
      {children}
    </p>
  );
}
