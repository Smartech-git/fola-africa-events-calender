"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import DotField from "@/components/animations/dot-field";
import HoverText from "@/components/animations/hover-text";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { ACCOUNT_BENEFITS } from "@/constants/account";
import { useAccount } from "@/hooks/use-account";

const DELAY_MS = 12_000;
const SNOOZE_DAYS = 3;
const STORAGE_KEY = "hoa-account-popup-dismissed";
const HIDDEN_ON = [
  "/sign-in",
  "/create-account",
  "/account",
  "/terms-of-use",
  "/privacy-policy",
];

function isSnoozed() {
  try {
    const at = Number(localStorage.getItem(STORAGE_KEY));
    return Boolean(at) && Date.now() - at < SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function snooze() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {}
}

export default function AccountAuthPopup() {
  const { signedIn } = useAccount();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState("/");

  const hidden =
    signedIn ||
    HIDDEN_ON.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

  useEffect(() => {
    if (hidden || isSnoozed()) return;
    const timer = window.setTimeout(() => {
      setNext(`${window.location.pathname}${window.location.search}`);
      setOpen(true);
    }, DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [hidden]);

  const close = () => {
    snooze();
    setOpen(false);
  };
  const query = new URLSearchParams({ next }).toString();

  return (
    <Modal.Root
      isOpen={open && !hidden}
      onOpenChange={(isOpen) => !isOpen && close()}
    >
      <Modal.Content isDismissable={false} size="4xl" scrollBehavior="normal">
        <div className="grid md:grid-cols-[47fr_53fr]">
          <aside className="flex flex-col justify-between gap-10 bg-red p-8 text-white max-md:hidden">
            <div className="flex flex-col gap-5">
              <p className="font-montreal text-5xl font-medium tracking-mono uppercase">
                Know what’s happening
              </p>
              <p className="font-montreal text-lg text-cream">
                With a Happenings account you can:
              </p>
              <ul className="flex flex-col border-t border-white/30">
                {ACCOUNT_BENEFITS.map((benefit) => (
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
            <Modal.Header label="Happenings account">
              Sign in or create an account
            </Modal.Header>
            <Modal.Body>
              <p>
                Submit happenings with your details ready every time, and follow
                each one from review to live. Signing in takes one email link,
                no password.
              </p>
            </Modal.Body>
            <Modal.Footer className="flex-col items-stretch max-sm:*:flex-none">
              <Link
                href={`/create-account?${query}`}
                onClick={close}
                className="w-full"
              >
                <Button size="md" className="w-full">
                  <HoverText text="Create an account" />
                </Button>
              </Link>
              <Link
                href={`/sign-in?${query}`}
                onClick={close}
                className="w-full"
              >
                <Button size="md" variant="bordered" className="w-full">
                  <HoverText text="Sign in" />
                </Button>
              </Link>
            </Modal.Footer>
          </div>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
