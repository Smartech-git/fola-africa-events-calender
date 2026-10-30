import type { Metadata } from "next";

import ContinueSignIn from "@/components/contents/account/continue-sign-in";
import SignInFlow from "@/components/contents/account/sign-in-flow";
import { signInLinkEmail } from "@/payload/members/member-auth";
import { safeNextPath } from "@/validations/member-account";

export const metadata: Metadata = {
  title: "Continue to Happenings",
  robots: { index: false, follow: false },
  // The URL carries the one-time token; never send it on to another site.
  referrer: "no-referrer",
};

interface Props {
  searchParams: Promise<{
    token?: string | string[];
    next?: string | string[];
  }>;
}

// The page the emailed link opens. Looking up the address does not use the
// link; only the Continue button does.
export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const next = safeNextPath(params.next);
  const email = await signInLinkEmail(token).catch(() => null);

  if (!email) return <SignInFlow variant="expired" next={next} />;
  return <ContinueSignIn token={token} next={next} email={email} />;
}
