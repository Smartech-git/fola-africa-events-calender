import Link from "next/link";

import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import SectionWrapper from "@/components/layout/section-wrapper";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profile", label: "Profile", href: "/account" },
  { id: "happenings", label: "My happenings", href: "/account/happenings" },
] as const;

export type AccountTab = (typeof TABS)[number]["id"];

interface Props {
  name: string;
  active: AccountTab;
  title: string;
  intro: string;
  happenings: number;
  /** Replaces "Account · name", e.g. on a happening's edit page. */
  kicker?: string;
}

export default function AccountHeader({
  name,
  active,
  title,
  intro,
  happenings,
  kicker,
}: Props) {
  return (
    <>
      <div className="w-full bg-cream">
        <SectionWrapper className="gap-3">
          <SurTitle dot content={kicker ?? `Account · ${name}`} />
          <FadeUpText
            as="h1"
            text={title}
            className="font-montreal text-6xl font-medium tracking-mono text-red uppercase md:text-8xl"
          />
          <FadeUpText
            text={intro}
            delay={0.1}
            className="font-montreal text-lg sm:text-2xl"
          />
        </SectionWrapper>
      </div>
      <nav
        aria-label="Account"
        className="w-full border-b border-ink/20 px-pg-sm sm:px-pg 2xl:px-pg-2xl 4k:px-pg-4k"
      >
        <ul className="flex gap-8">
          {TABS.map((tab) => {
            const current = tab.id === active;
            return (
              <li key={tab.id}>
                <Link
                  href={tab.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "-mb-[1.5px] flex items-center gap-2 border-b-[3px] py-3 font-courier text-sm tracking-cou uppercase transition-colors focus-visible:outline-2 focus-visible:outline-red md:py-4",
                    current
                      ? "border-red text-red"
                      : "border-transparent hover:text-red",
                  )}
                >
                  {current && (
                    <span
                      aria-hidden="true"
                      className="mb-0.5 size-2 shrink-0 rounded-full bg-red"
                    />
                  )}
                  {tab.label}
                  {tab.id === "happenings" && (
                    <span
                      className={current ? "text-red/60" : "text-ink/50"}
                      aria-label={`${happenings} submitted`}
                    >
                      {happenings}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
