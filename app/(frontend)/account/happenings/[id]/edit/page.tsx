import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import type { Metadata } from "next";

import HoverText from "@/components/animations/hover-text";
import AccountHeader from "@/components/contents/account/account-header";
import EditHappeningForm from "@/components/contents/account/edit-happening-form";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { happeningDisplay } from "@/lib/account/happening-display";
import { getMember } from "@/lib/auth/member-session";
import { loadEditableHappening } from "@/payload/members/happening-edits";
import { getMemberHappenings } from "@/payload/members/member-happenings";

export const metadata: Metadata = {
  title: "Edit happening",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

const LOCKED_REASON: Record<string, string> = {
  withdrawn:
    "You withdrew this submission, so it can’t be edited. To list it, submit it again.",
  cancelled:
    "This happening is cancelled. To change it, contact the Happenings team.",
  rejected:
    "This happening wasn’t approved and its date has passed, so it can’t be resubmitted.",
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  const eventId = Number(id);
  const member = await getMember();
  if (!member)
    redirect(
      `/sign-in?${new URLSearchParams({ next: `/account/happenings/${id}/edit` })}`,
    );
  if (!Number.isInteger(eventId) || eventId < 1) notFound();

  const [loaded, happenings] = await Promise.all([
    loadEditableHappening(member.id, eventId),
    getMemberHappenings(member.id),
  ]);
  if (!loaded) notFound();
  const { event, mode, pending, live, values } = loaded;
  const display = happeningDisplay(event);
  const artwork =
    event.artwork && typeof event.artwork === "object" ? event.artwork : null;
  const artworkUrl = artwork?.sizes?.card?.url ?? artwork?.url;

  return (
    <>
      <AccountHeader
        name={member.fullName}
        active="happenings"
        kicker={`My happenings · ${event.title}`}
        title="Edit happening"
        intro={
          event.status === "rejected" && mode === "direct"
            ? "Fix what the team flagged, then send it back for review"
            : mode === "direct"
              ? "Fix anything before the team approves it"
              : mode === "request"
                ? "Changes go back for approval. The live listing stays as it is until they are approved"
                : "This happening can no longer be edited here"
        }
        happenings={happenings.length}
      />
      <SectionWrapper className="gap-10">
        {mode === "locked" ? (
          <div className="flex max-w-2xl flex-col items-start gap-6">
            <p className="font-montreal text-xl sm:text-2xl">
              {LOCKED_REASON[event.status] ??
                "This happening has ended. Past listings stay on the calendar as they were."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/account/happenings">
                <Button size="md">
                  <HoverText text="Back to my happenings" />
                </Button>
              </Link>
              {display.publicHref && (
                <Link href={display.publicHref}>
                  <Button size="md" variant="bordered">
                    <HoverText text="View listing" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <EditHappeningForm
            eventId={event.id}
            mode={mode}
            status={event.status}
            title={event.title}
            statusLine={display.statusLine}
            meta={display.meta}
            publicHref={display.publicHref}
            cityName={display.city?.name ?? ""}
            timezoneLabel={display.city?.timezoneLabel}
            organiser={display.organiser}
            live={live}
            values={values}
            hasPending={Boolean(pending)}
            pendingNote={pending?.note}
            artworkCurrent={
              artwork && artworkUrl
                ? { id: String(artwork.id), url: artworkUrl }
                : undefined
            }
            when={display.when}
          />
        )}
      </SectionWrapper>
    </>
  );
}
