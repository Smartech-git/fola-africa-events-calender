import { redirect } from "next/navigation";

import type { Metadata } from "next";

import CreateAccountFlow from "@/components/contents/account/create-account-flow";
import SectionWrapper from "@/components/layout/section-wrapper";
import { SITE_NAME } from "@/constants/brand";
import { getMember } from "@/lib/auth/member-session";
import { pageMetadata } from "@/lib/metadata";
import { getMemberCityOptions } from "@/payload/members/member-options";
import { safeNextPath } from "@/validations/member-account";

export const metadata: Metadata = {
  ...pageMetadata(
    "Create an account",
    `Create your ${SITE_NAME} profile so your details prefill every submission.`,
    "/create-account",
  ),
  robots: { index: false },
};

interface Props {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default async function Page({ searchParams }: Props) {
  const next = safeNextPath((await searchParams).next);
  if (await getMember()) redirect(next ?? "/account");

  let cities;
  try {
    cities = await getMemberCityOptions();
  } catch {
    return (
      <SectionWrapper>
        <p role="alert" className="font-montreal text-lg">
          We couldn’t load the sign-up form. Please refresh and try again.
        </p>
      </SectionWrapper>
    );
  }
  return <CreateAccountFlow cities={cities} next={next} />;
}
