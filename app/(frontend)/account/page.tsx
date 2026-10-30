import { redirect } from "next/navigation";

import type { Metadata } from "next";

import AccountHeader from "@/components/contents/account/account-header";
import AccountSidebar from "@/components/contents/account/account-sidebar";
import ProfileForm from "@/components/contents/account/profile-form";
import SectionWrapper from "@/components/layout/section-wrapper";
import { getMember } from "@/lib/auth/member-session";
import {
  getMemberHappenings,
  happeningCounts,
} from "@/payload/members/member-happenings";
import { getMemberCityOptions } from "@/payload/members/member-options";
import { relationID } from "@/payload/validation";

export const metadata: Metadata = {
  title: "Your profile",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const member = await getMember();
  if (!member) redirect("/sign-in?next=/account");

  const [cities, happenings] = await Promise.all([
    getMemberCityOptions(),
    getMemberHappenings(member.id),
  ]);
  const city = relationID(member.city);

  return (
    <>
      <AccountHeader
        name={member.fullName}
        active="profile"
        title="Your profile"
        intro="Your details prefill every submission. Only the Happenings team sees them"
        happenings={happenings.length}
      />
      <SectionWrapper className="gap-12 lg:flex-row lg:gap-16 xl:gap-24">
        <AccountSidebar member={member} counts={happeningCounts(happenings)} />
        <ProfileForm
          email={member.email}
          cities={cities}
          values={{
            fullName: member.fullName,
            phone: member.phone ?? "",
            organisation: member.organisation ?? "",
            role: member.role ?? "",
            industry: member.industry ?? "",
            city: city ? String(city) : "",
            country: member.country ?? "",
            describes: member.describes ?? "",
            marketingConsent: Boolean(member.marketingConsent),
          }}
        />
      </SectionWrapper>
    </>
  );
}
