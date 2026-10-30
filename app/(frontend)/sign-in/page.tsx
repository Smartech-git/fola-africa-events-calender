import { redirect } from "next/navigation";

import type { Metadata } from "next";

import SignInFlow from "@/components/contents/account/sign-in-flow";
import { SITE_NAME } from "@/constants/brand";
import { getMember } from "@/lib/auth/member-session";
import { pageMetadata } from "@/lib/metadata";
import { safeNextPath } from "@/validations/member-account";

export const metadata: Metadata = {
  ...pageMetadata(
    "Sign in",
    `Sign in to ${SITE_NAME} with a one-time email link. No password.`,
    "/sign-in",
  ),
  robots: { index: false },
};

interface Props {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default async function Page({ searchParams }: Props) {
  const next = safeNextPath((await searchParams).next);
  if (await getMember()) redirect(next ?? "/account");
  return <SignInFlow next={next} />;
}
