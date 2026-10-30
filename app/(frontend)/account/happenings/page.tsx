import { redirect } from "next/navigation";

import type { Metadata } from "next";

import AccountHeader from "@/components/contents/account/account-header";
import MyHappenings from "@/components/contents/account/my-happenings";
import SignOutButton from "@/components/contents/account/sign-out-button";
import SectionWrapper from "@/components/layout/section-wrapper";
import { getMember } from "@/lib/auth/member-session";
import {
  getMemberHappenings,
  HAPPENING_FILTERS,
  happeningCounts,
  type HappeningFilter,
} from "@/payload/members/member-happenings";

export const metadata: Metadata = {
  title: "My happenings",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ show?: string | string[] }>;
}

export default async function Page({ searchParams }: Props) {
  const member = await getMember();
  if (!member) redirect("/sign-in?next=/account/happenings");

  const { show } = await searchParams;
  const filter: HappeningFilter =
    HAPPENING_FILTERS.find((entry) => entry.value === show)?.value ??
    "upcoming";
  const happenings = await getMemberHappenings(member.id);

  return (
    <>
      <AccountHeader
        name={member.fullName}
        active="happenings"
        title="My happenings"
        intro="Every happening you have submitted, from review to live"
        happenings={happenings.length}
      />
      <SectionWrapper className="gap-10">
        <MyHappenings
          happenings={happenings}
          counts={happeningCounts(happenings)}
          filter={filter}
        />
        <SignOutButton className="lg:hidden" />
      </SectionWrapper>
    </>
  );
}
