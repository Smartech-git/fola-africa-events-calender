"use client";

import { useEffect, useState } from "react";

import { ArrowRight } from "lucide-react";

import HoverText from "@/components/animations/hover-text";
import { AuthNote, AuthTitle } from "@/components/contents/account/auth-layout";
import Button from "@/components/ui/button";
import DateCircle from "@/components/ui/date-circle";
import { LINK_MINUTES, RESEND_SECONDS } from "@/constants/account";
import { CONTACT_EMAIL } from "@/constants/socials";

const STEPS = [
  { label: "Sent", text: "A one-time link is on its way to your inbox." },
  {
    label: "Open the email",
    text: "From Happenings of Africa. Press Sign in.",
  },
  {
    label: "Continue",
    text: "Confirm on the page it opens, and you are in.",
  },
];

interface Props {
  email: string;
  /** When the last link was requested; Resend unlocks a minute later. */
  sentAt: number;
  isResending?: boolean;
  error?: string;
  onResend: () => void;
  onChangeEmail: () => void;
}

export default function CheckEmail({
  email,
  sentAt,
  isResending,
  error,
  onResend,
  onChangeEmail,
}: Props) {
  const remaining = useCountdown(sentAt + RESEND_SECONDS * 1000);
  const locked = remaining > 0;

  return (
    <>
      <AuthTitle
        title="Check your email"
        intro={`If ${email} is on Happenings, a sign-in link is on its way`}
      />

      <div className="flex flex-col gap-1.5 bg-cream px-5 py-4">
        <span className="font-courier text-xs tracking-cou text-red uppercase">
          Sent to
        </span>
        <span className="font-montreal text-lg break-all">{email}</span>
      </div>

      <ol className="flex flex-col">
        {STEPS.map((step, index) => (
          <li
            key={step.label}
            className="flex items-center gap-3.5 border-b border-ink/20 py-3.5"
          >
            <DateCircle size="sm" variant={index === 0 ? "filled" : "outline"}>
              {String(index + 1).padStart(2, "0")}
            </DateCircle>
            <span className="flex flex-col gap-1">
              <span
                className={
                  index === 0
                    ? "font-courier text-xs tracking-cou text-red uppercase"
                    : "font-courier text-xs tracking-cou uppercase"
                }
              >
                {step.label}
              </span>
              <span className="font-montreal text-base">{step.text}</span>
            </span>
          </li>
        ))}
      </ol>

      <AuthNote className="uppercase">
        The link works once and expires in {LINK_MINUTES} minutes.
      </AuthNote>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="button"
          variant="bordered"
          size="md"
          disabled={locked || isResending}
          isLoading={isResending}
          onPress={onResend}
        >
          <HoverText text="Resend link" />
        </Button>
        <span
          aria-live="polite"
          className="font-courier text-xs tracking-cou text-ink/70 uppercase"
        >
          {locked
            ? `Available in ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
            : "You can resend now"}
        </span>
      </div>
      {error && (
        <AuthNote tone="error" role="alert">
          {error}
        </AuthNote>
      )}

      <Button
        type="button"
        variant="flat"
        size="fit"
        onPress={onChangeEmail}
        className="text-red"
        endContent={<ArrowRight size={14} aria-hidden="true" />}
      >
        <HoverText text="Use a different email" />
      </Button>

      <p className="font-montreal text-sm text-ink/70">
        Nothing there? Check your spam or promotions folder, and add{" "}
        {CONTACT_EMAIL} to your contacts.
      </p>
    </>
  );
}

/**
 * Whole seconds left until `until`, ticking down once a second. Callers remount
 * the component (key) for a new `until`, so the clock starts fresh.
 */
function useCountdown(until: number) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= until) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [until]);

  return Math.max(0, Math.ceil((until - now) / 1000));
}
