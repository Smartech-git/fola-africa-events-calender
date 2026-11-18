"use client";

import { useActionState, useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Check } from "lucide-react";

import {
  subscribeToEmails,
  type SubscribeState,
} from "@/actions/email-subscription";
import DotField from "@/components/animations/dot-field";
import HoverText from "@/components/animations/hover-text";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { useAccount } from "@/hooks/use-account";

const DELAY_MS = 15_000;
/** Set once someone subscribes here; the popup never shows on this browser again. */
const SUBSCRIBED_KEY = "hoa-subscribed";
const HIDDEN_ON = [
  "/sign-in",
  "/create-account",
  "/account",
  "/terms-of-use",
  "/privacy-policy",
];

const BENEFITS = [
  "What’s happening this week",
  "New happenings in your city",
  "Seasons and festivals as they’re announced",
];

const idle: SubscribeState = { status: "idle" };

function hasSubscribed() {
  try {
    return localStorage.getItem(SUBSCRIBED_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberSubscribed() {
  try {
    localStorage.setItem(SUBSCRIBED_KEY, "1");
  } catch {}
}

/** Email-only newsletter sign-up, shown to signed-out visitors after a delay. */
export default function SubscribePopup() {
  const { signedIn } = useAccount();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [state, subscribe, isPending] = useActionState(
    async (previous: SubscribeState, formData: FormData) => {
      const result = await subscribeToEmails(previous, formData);
      if (result.status === "subscribed") rememberSubscribed();
      return result;
    },
    idle,
  );

  const hidden =
    signedIn ||
    HIDDEN_ON.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

  useEffect(() => {
    if (hidden || hasSubscribed()) return;
    const timer = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [hidden]);

  const subscribed = state.status === "subscribed";

  return (
    <Modal.Root
      isOpen={open && !hidden}
      onOpenChange={(isOpen) => !isOpen && setOpen(false)}
    >
      <Modal.Content isDismissable={false} size="4xl" scrollBehavior="normal">
        {(close) => (
          <div className="grid md:grid-cols-[47fr_53fr]">
            <aside className="flex flex-col justify-between gap-10 bg-red p-8 text-white max-md:hidden">
              <div className="flex flex-col gap-5">
                <p className="font-montreal text-5xl font-medium tracking-mono uppercase">
                  Know what’s happening
                </p>
                <p className="font-montreal text-lg text-cream">
                  In your inbox:
                </p>
                <ul className="flex flex-col border-t border-white/30">
                  {BENEFITS.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-center gap-3 border-b border-white/30 py-3 font-courier text-xs tracking-cou uppercase"
                    >
                      <span
                        aria-hidden="true"
                        className="mb-0.5 size-2 shrink-0 rounded-full bg-white"
                      />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <DotField className="h-20" seed={3} />
            </aside>

            <div className="flex flex-col justify-center">
              <Modal.Header label="Happenings emails">
                {subscribed ? "You’re on the list" : "Get happenings by email"}
              </Modal.Header>

              {subscribed ? (
                <>
                  <Modal.Body>
                    <p role="status" className="flex gap-3">
                      <Check
                        size={20}
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-red"
                      />
                      Thanks for subscribing. Look out for Happenings in your
                      inbox.
                    </p>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button size="md" onPress={close} className="w-full">
                      <HoverText text="Close" />
                    </Button>
                  </Modal.Footer>
                </>
              ) : (
                <form action={subscribe} noValidate>
                  <Modal.Body>
                    <p>
                      The best of what’s on, sent to your email
                    </p>
                    <Input
                      name="email"
                      type="email"
                      label="Email address"
                      autoComplete="email"
                      isRequired
                      isDisabled={isPending}
                      isInvalid={state.status === "error"}
                      errorMessage={state.error}
                    />
                    {/* Honeypot: hidden from people and assistive tech. */}
                    <input
                      type="text"
                      name="company"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="absolute -left-[9999px] size-px opacity-0"
                    />
                  </Modal.Body>
                  <Modal.Footer className="flex-col items-stretch gap-4">
                    <Button
                      type="submit"
                      size="md"
                      isLoading={isPending}
                      className="w-full"
                    >
                      <HoverText text="Subscribe" />
                    </Button>
                    <p className="font-courier text-xs tracking-cou text-ink/70 uppercase">
                      By subscribing you agree to receive emails from
                      Happenings. Unsubscribe at any time. See our{" "}
                      <Link
                        href="/privacy-policy"
                        onClick={close}
                        className="underline underline-offset-2 hover:text-red focus-visible:outline-2 focus-visible:outline-red"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </Modal.Footer>
                </form>
              )}
            </div>
          </div>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}
