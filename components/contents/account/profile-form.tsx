"use client";

import { useState, useTransition, type ReactNode } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Check } from "lucide-react";
import { Controller } from "react-hook-form";
import { mutate } from "swr";

import {
  saveProfile,
  signOutEverywhere,
  type MemberActionState,
} from "@/actions/member-auth";
import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import ProfileFields, {
  type CityOption,
} from "@/components/contents/account/profile-fields";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/check-box";
import DateCircle from "@/components/ui/date-circle";
import Input from "@/components/ui/input";
import { CONTACT_EMAIL } from "@/constants/socials";
import { ACCOUNT_ENDPOINT } from "@/hooks/use-account";
import useReactHookForm from "@/hooks/use-react-form";
import {
  profileSchema,
  type ProfileValues,
} from "@/validations/member-account";

const idle: MemberActionState = { status: "idle" };

const savedTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));

function AccountSection({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  const id = `profile-section-${number}`;
  return (
    <section
      aria-labelledby={id}
      className="flex min-w-0 flex-col gap-5 border-t-[1.5px] border-ink pt-10 pb-12 first:border-t-0 first:pt-0"
    >
      <div className="flex items-center gap-4">
        <DateCircle size="sm">{String(number).padStart(2, "0")}</DateCircle>
        <FadeUpText
          as="h2"
          id={id}
          text={title}
          className="font-montreal text-2xl font-medium tracking-mono uppercase sm:text-4xl"
        />
      </div>
      {children}
    </section>
  );
}

interface Props {
  email: string;
  values: ProfileValues;
  cities: CityOption[];
}

// Figma: 24 — Profile. The same fields as Create Account; email changes and
// deletion go through the Happenings team.
export default function ProfileForm({ email, values, cities }: Props) {
  const router = useRouter();
  const [state, setState] = useState<MemberActionState>(idle);
  const [isSaving, startSaving] = useTransition();
  const [isSigningOut, startSigningOut] = useTransition();
  const { control, handleSubmit, reset, formState } = useReactHookForm(
    profileSchema,
    values,
  );

  const save = (data: ProfileValues) =>
    startSaving(async () => {
      const result = await saveProfile(idle, data);
      setState(result);
      if (result.status !== "saved") return;
      reset(data);
      // The header and sidebar show the name and organisation.
      void mutate(ACCOUNT_ENDPOINT);
      router.refresh();
    });

  const busy = isSaving || isSigningOut;
  const deletionHref = `mailto:${CONTACT_EMAIL}?${new URLSearchParams({
    subject: "Delete my Happenings account",
  })
    .toString()
    .replace(/\+/g, "%20")}`;

  return (
    <form
      noValidate
      className="flex min-w-0 flex-1 flex-col"
      onSubmit={handleSubmit(save)}
    >
      <AccountSection number={1} title="About you">
        <ProfileFields control={control} cities={cities} disabled={busy} />
      </AccountSection>

      <AccountSection number={2} title="Email and sign-in">
        <Input
          label="Email address"
          value={email}
          isReadOnly
          description={`To change your email, contact ${CONTACT_EMAIL}. It is how you sign in, so we confirm the new address first.`}
          classNames={{
            inputWrapper: "bg-cream! border-cream",
            description: "font-montreal text-sm normal-case",
          }}
        />
        <div className="flex flex-col gap-4 bg-ink px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-courier text-xs tracking-cou text-cream uppercase">
              No password
            </span>
            <span className="font-montreal text-base">
              You sign in with a one-time link sent to this address.
            </span>
          </div>
          <Button
            type="button"
            variant="outlineWhite"
            size="md"
            isLoading={isSigningOut}
            disabled={busy}
            onPress={() => startSigningOut(() => signOutEverywhere())}
            className="shrink-0 max-sm:w-full"
          >
            <HoverText text="Sign out of all devices" />
          </Button>
        </div>
      </AccountSection>

      <AccountSection number={3} title="Email preferences">
        <Checkbox isSelected isDisabled>
          <span className="flex flex-col gap-1">
            <span className="text-red">Account emails · Always on</span>
            <span className="font-montreal text-base normal-case">
              Sign-in links and updates about your submissions: received and
              live.
            </span>
          </span>
        </Checkbox>
        <Controller
          control={control}
          name="marketingConsent"
          render={({ field }) => (
            <Checkbox
              ref={field.ref}
              name={field.name}
              isSelected={field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              isDisabled={busy}
            >
              <span className="flex flex-col gap-1">
                <span className="text-ink/70">Optional · Marketing</span>
                <span className="font-montreal text-base normal-case">
                  Send me Happenings updates, such as This Week in Lagos. You
                  can change this at any time.
                </span>
              </span>
            </Checkbox>
          )}
        />
      </AccountSection>

      <AccountSection number={4} title="Your data">
        <p className="font-montreal text-base sm:text-lg">
          Your details are used to run your account and verify your submissions.
          They never appear on the calendar unless you add them as event contact
          information.
        </p>
        <div className="flex flex-col gap-4 border border-ink/20 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-courier text-xs tracking-cou text-red uppercase">
              Delete account
            </span>
            <span className="font-montreal text-base">
              We remove your contact details. Happenings already on the calendar
              stay listed.
            </span>
          </div>
          <Link href={deletionHref} className="shrink-0 max-sm:w-full">
            <Button variant="bordered" size="md" className="w-full">
              <HoverText text="Request deletion" />
            </Button>
          </Link>
        </div>
      </AccountSection>

      <div className="flex flex-col gap-4 border-t-[1.5px] border-ink pt-8 sm:flex-row sm:items-center">
        <Button
          type="submit"
          variant="solid"
          size="md"
          isLoading={isSaving}
          disabled={busy}
          className="max-sm:w-full"
        >
          <HoverText text="Save changes" />
        </Button>
        <p
          aria-live="polite"
          className="flex gap-2 font-courier text-xs tracking-cou uppercase"
        >
          {state.status === "error" ? (
            <span role="alert" className="text-red">
              {state.error}
            </span>
          ) : formState.isDirty ? (
            <span className="text-ink/70">Unsaved changes</span>
          ) : state.status === "saved" && state.savedAt ? (
            <>
              <Check size={14} className="mt-1" aria-hidden="true" />
              All changes saved · {savedTime(state.savedAt)}
            </>
          ) : null}
        </p>
      </div>
    </form>
  );
}
