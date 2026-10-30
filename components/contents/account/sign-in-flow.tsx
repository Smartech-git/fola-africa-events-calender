"use client";

import { useState, useTransition } from "react";

import {
  requestSignInLink,
  type MemberActionState,
} from "@/actions/member-auth";
import HoverText from "@/components/animations/hover-text";
import AuthLayout, {
  AuthNote,
  AuthTabs,
  AuthTitle,
} from "@/components/contents/account/auth-layout";
import CheckEmail from "@/components/contents/account/check-email";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { LINK_MINUTES } from "@/constants/account";
import useReactHookForm from "@/hooks/use-react-form";
import { signInSchema, type SignInValues } from "@/validations/member-account";

const idle: MemberActionState = { status: "idle" };

export interface SentLink {
  email: string;
  at: number;
}

/** Sends a sign-in link and tracks when, so Check Your Email can unlock Resend. */
export function useSendLink() {
  const [sent, setSent] = useState<SentLink | null>(null);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const send = (data: SignInValues) =>
    startTransition(async () => {
      setError(undefined);
      const result = await requestSignInLink(idle, data);
      if (result.status === "sent")
        setSent({ email: result.email ?? data.email, at: Date.now() });
      else setError(result.error);
    });

  return { sent, setSent, error, setError, isPending, send };
}

export const CHECK_EMAIL_ASIDE = {
  heading: "One link. No password",
  intro: "We email you a one-time link instead of asking for a password",
};

interface Props {
  /** "expired": the page an expired or used link opens (Figma: Link Expired). */
  variant?: "sign-in" | "expired";
  next?: string;
  defaultEmail?: string;
}

// Figma: 10 — Sign In and 26 — Link Expired. Google sign-in comes later.
export default function SignInFlow({
  variant = "sign-in",
  next,
  defaultEmail = "",
}: Props) {
  const { sent, setSent, error, setError, isPending, send } = useSendLink();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useReactHookForm(signInSchema, { email: defaultEmail, next });

  if (sent)
    return (
      <AuthLayout {...CHECK_EMAIL_ASIDE}>
        <CheckEmail
          key={sent.at}
          email={sent.email}
          sentAt={sent.at}
          isResending={isPending}
          error={error}
          onResend={() => send({ email: sent.email, next })}
          onChangeEmail={() => {
            setError(undefined);
            setSent(null);
          }}
        />
      </AuthLayout>
    );

  const expired = variant === "expired";

  return (
    <AuthLayout
      heading={expired ? "Know what’s happening" : "Check Happenings"}
      intro={
        expired
          ? "Your calendar, your submissions and your profile, one step away"
          : "Know what’s happening in your city, and put your own happenings on the calendar"
      }
    >
      {expired ? (
        <AuthTitle
          surTitle="Link expired"
          title="This link has expired"
          intro={`Sign-in links work once and expire after ${LINK_MINUTES} minutes. Send a new one and it will arrive straight away`}
        />
      ) : (
        <>
          <AuthTitle
            title="Sign in to Happenings"
            intro="Submit your own happenings and follow them from review to live"
          />
          <AuthTabs active="sign-in" next={next} />
        </>
      )}

      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={handleSubmit(send)}
      >
        <Input
          {...register("email")}
          type="email"
          label="Email address"
          placeholder="you@company.com"
          autoComplete="email"
          isRequired
          isDisabled={isPending}
          isInvalid={Boolean(errors.email)}
          errorMessage={errors.email?.message}
        />
        <Button
          type="submit"
          variant="solid"
          size="md"
          isLoading={isPending}
          disabled={isPending}
          className="w-full"
        >
          <HoverText text={expired ? "Send a new link" : "Continue"} />
        </Button>
        {error && (
          <AuthNote tone="error" role="alert">
            {error}
          </AuthNote>
        )}
        {!expired && (
          <AuthNote>No password. A sign-in link arrives by email.</AuthNote>
        )}
      </form>
    </AuthLayout>
  );
}
