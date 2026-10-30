"use client";

import { useActionState } from "react";

import { completeSignIn, type MemberActionState } from "@/actions/member-auth";
import HoverText from "@/components/animations/hover-text";
import AuthLayout, {
  AuthNote,
  AuthTitle,
} from "@/components/contents/account/auth-layout";
import SignInFlow from "@/components/contents/account/sign-in-flow";
import Button from "@/components/ui/button";

interface Props {
  token: string;
  next?: string;
  email: string;
}

// Figma: 26 — Continue to Happenings. The link never signs in on load: email
// scanners open links automatically and would use up the one-time token.
export default function ContinueSignIn({ token, next, email }: Props) {
  const [state, action, isPending] = useActionState<
    MemberActionState,
    FormData
  >(completeSignIn, { status: "idle" });

  // Used or expired since the page loaded, for example in another tab.
  if (state.status === "error")
    return <SignInFlow variant="expired" next={next} defaultEmail={email} />;

  return (
    <AuthLayout
      heading="Know what’s happening"
      intro="Your calendar, your submissions and your profile, one step away"
    >
      <AuthTitle surTitle="One more step" title="Continue to Happenings" />
      <div className="flex flex-col gap-1.5 bg-cream px-5 py-4">
        <span className="font-courier text-xs tracking-cou text-red uppercase">
          Signing in as
        </span>
        <span className="font-montreal text-lg break-all">{email}</span>
      </div>
      <form action={action} className="flex flex-col gap-5">
        <input type="hidden" name="token" value={token} />
        {next && <input type="hidden" name="next" value={next} />}
        <Button
          type="submit"
          variant="solid"
          size="md"
          isLoading={isPending}
          disabled={isPending}
          className="w-full"
        >
          <HoverText text="Continue to Happenings" />
        </Button>
      </form>
      <p className="font-montreal text-sm text-ink/70">
        This extra step stops email scanners from using up your one-time link.
      </p>
      <AuthNote className="uppercase">
        Not you? Close this page. Nothing happens until you continue.
      </AuthNote>
    </AuthLayout>
  );
}
