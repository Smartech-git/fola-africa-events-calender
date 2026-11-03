import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import type { Metadata } from "next";

import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import SurTitle from "@/components/common/sur-title";
import Header from "@/components/header/header";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import DateCircle from "@/components/ui/date-circle";
import { happeningDisplay } from "@/lib/account/happening-display";
import { getMember } from "@/lib/auth/member-session";
import { loadEditableHappening } from "@/payload/members/happening-edits";

export const metadata: Metadata = {
  title: "Your happening",
  robots: { index: false, follow: false },
};

const RESULTS = {
  submitted: {
    kicker: "Changes submitted",
    heading: "Changes submitted.",
    copy: "Your edits go back to Happenings for approval. The current approved version stays live until the new version is approved. We’ll email you when they’re decided.",
  },
  saved: {
    kicker: "Changes saved",
    heading: "Changes saved.",
    copy: "Your submission is updated. The Happenings team reviews the latest version before it goes on the calendar.",
  },
  cancelled: {
    kicker: "Cancelled",
    heading: "Happening cancelled.",
    copy: "It now shows as Cancelled on the calendar. The Happenings team has been told, and we’ve emailed you a confirmation.",
  },
  postponed: {
    kicker: "Postponed",
    heading: "Happening postponed.",
    copy: "It now shows as Postponed · New date to be confirmed. The team has been told. When you have the new date, edit the happening and it goes back on the calendar once approved.",
  },
  withdrawn: {
    kicker: "Withdrawn",
    heading: "Submission withdrawn.",
    copy: "It has left the review queue and won’t appear on the calendar.",
  },
} as const;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ result?: string }>;
}

// Figma: 14 — Changes submitted (the red confirmation band).
export default async function Page({ params, searchParams }: Props) {
  const [{ id }, { result }] = await Promise.all([params, searchParams]);
  const member = await getMember();
  if (!member) redirect("/sign-in?next=/account/happenings");
  const outcome = RESULTS[result as keyof typeof RESULTS];
  const loaded = outcome
    ? await loadEditableHappening(member.id, Number(id))
    : null;
  if (!outcome || !loaded) notFound();
  const { event } = loaded;
  const display = happeningDisplay(event);

  return (
    <div className="relative -mt-sm-header flex w-full flex-col sm:-mt-header">
      <div className="relative z-60 flex w-full flex-col bg-red text-white">
        <Header isLight />
        <SectionWrapper className="items-start gap-8">
          <SurTitle
            dot
            content={`${outcome.kicker} · ${event.title}`}
            className="text-white"
          />
          <FadeUpText
            as="h1"
            text={outcome.heading}
            delay={0.1}
            className="font-montreal text-6xl font-medium tracking-mono uppercase md:text-7xl xl:text-8xl"
          />
          <p className="max-w-190 font-montreal text-lg text-cream sm:text-2xl">
            {outcome.copy}
          </p>
          {result === "submitted" && (
            <ol className="flex flex-wrap gap-8">
              <li className="flex items-center gap-3">
                <DateCircle variant="white">01</DateCircle>
                <span className="flex flex-col font-courier text-xs tracking-cou uppercase">
                  <span>Current version</span>
                  <span className="text-cream">{display.statusLine}</span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <DateCircle variant="outlineWhite">02</DateCircle>
                <span className="flex flex-col font-courier text-xs tracking-cou uppercase">
                  <span>New version</span>
                  <span className="text-cream">Pending review</span>
                </span>
              </li>
            </ol>
          )}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/account/happenings" className="w-full sm:w-fit">
              <Button variant="onWhite" size="md" className="w-full">
                <HoverText text="View my happenings" />
              </Button>
            </Link>
            {display.publicHref ? (
              <Link href={display.publicHref} className="w-full sm:w-fit">
                <Button variant="outlineWhite" size="md" className="w-full">
                  <HoverText text="View listing" />
                </Button>
              </Link>
            ) : (
              <Link href="/cities" className="w-full sm:w-fit">
                <Button variant="outlineWhite" size="md" className="w-full">
                  <HoverText text="Back to calendar" />
                </Button>
              </Link>
            )}
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
}
