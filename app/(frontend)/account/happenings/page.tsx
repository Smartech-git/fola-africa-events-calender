import { redirect } from "next/navigation";

import type { Metadata } from "next";

import AccountHeader from "@/components/contents/account/account-header";
import MyHappenings from "@/components/contents/account/my-happenings";
import SectionWrapper from "@/components/layout/section-wrapper";
import { getMember } from "@/lib/auth/member-session";
import {
  defaultFilter,
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
  const happenings = await getMemberHappenings(member.id);
  const counts = happeningCounts(happenings);
  const filter: HappeningFilter =
    HAPPENING_FILTERS.find((entry) => entry.value === show)?.value ??
    defaultFilter(counts);

  return (
    <>
      <AccountHeader
        name={member.fullName}
        active="happenings"
        title="My happenings"
        intro="Every happening you have submitted, from review to live"
        happenings={happenings.length}
      />
      <SectionWrapper className="gap-6 md:gap-10 md:pt-7">
        <MyHappenings happenings={happenings} counts={counts} filter={filter} />
      </SectionWrapper>
    </>
  );
}
