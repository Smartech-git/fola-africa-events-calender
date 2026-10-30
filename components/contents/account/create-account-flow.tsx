"use client";

import { useState, useTransition } from "react";

import Link from "next/link";

import { Controller, type Control } from "react-hook-form";

import { createAccount, type MemberActionState } from "@/actions/member-auth";
import HoverText from "@/components/animations/hover-text";
import AuthLayout, {
  AuthNote,
  AuthTabs,
  AuthTitle,
} from "@/components/contents/account/auth-layout";
import CheckEmail from "@/components/contents/account/check-email";
import ProfileFields, {
  type CityOption,
} from "@/components/contents/account/profile-fields";
import {
  CHECK_EMAIL_ASIDE,
  useSendLink,
} from "@/components/contents/account/sign-in-flow";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/check-box";
import Input from "@/components/ui/input";
import { ACCOUNT_BENEFITS } from "@/constants/account";
import useReactHookForm from "@/hooks/use-react-form";
import {
  createAccountSchema,
  profileDefaults,
  type CreateAccountValues,
  type ProfileValues,
} from "@/validations/member-account";

const idle: MemberActionState = { status: "idle" };

// A new tab keeps the half-filled form.
const legalLink = {
  target: "_blank",
  rel: "noopener noreferrer",
  className: "hover:underline max-sm:text-red mx-0.5 text-red font-courier uppercase",
} as const;


interface Props {
  cities: CityOption[];
  next?: string;
}

export default function CreateAccountFlow({ cities, next }: Props) {
  const resend = useSendLink();
  const [created, setCreated] = useState<{ email: string; at: number }>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const { control, register, handleSubmit, formState } = useReactHookForm(
    createAccountSchema,
    {
      ...profileDefaults,
      email: "",
      next,
    },
  );
  const { errors } = formState;

  const submit = (data: CreateAccountValues) =>
    startTransition(async () => {
      setError(undefined);
      const result = await createAccount(idle, data);
      if (result.status === "sent")
        setCreated({ email: result.email ?? data.email, at: Date.now() });
      else setError(result.error);
    });

  const sent = resend.sent ?? created;
  if (sent)
    return (
      <AuthLayout {...CHECK_EMAIL_ASIDE}>
        <CheckEmail
          key={sent.at}
          email={sent.email}
          sentAt={sent.at}
          isResending={resend.isPending}
          error={resend.error}
          onResend={() => resend.send({ email: sent.email, next })}
          onChangeEmail={() => {
            resend.setSent(null);
            resend.setError(undefined);
            setCreated(undefined);
          }}
        />
      </AuthLayout>
    );

  return (
    <AuthLayout
      heading="Know what’s happening"
      intro="With a Happenings account you can:"
      dotsAt="bottom"
      wide
      asideContent={
        <ul className="flex max-w-125 flex-col border-t border-white/30">
          {ACCOUNT_BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="flex items-center gap-3 border-b border-white/30 py-3.5 font-courier text-sm tracking-cou uppercase"
            >
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full bg-white"
              />
              {benefit}
            </li>
          ))}
        </ul>
      }
    >
      <AuthTitle
        title="Create your Happenings profile"
        intro="So you don’t have to enter your details every time you submit"
      />
      <AuthTabs active="create-account" next={next} />

      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={handleSubmit(submit)}
      >
        <ProfileFields
          control={control as unknown as Control<ProfileValues>}
          cities={cities}
          disabled={isPending}
          email={
            <Input
              {...register("email")}
              type="email"
              label="Email address"
              autoComplete="email"
              isRequired
              isDisabled={isPending}
              isInvalid={Boolean(errors.email)}
              errorMessage={errors.email?.message}
            />
          }
        />

        <div className="flex flex-col gap-1 border-t border-ink/20 pt-5">
          <Controller
            control={control}
            name="terms"
            render={({ field }) => (
              <Checkbox
                ref={field.ref}
                name={field.name}
                isSelected={Boolean(field.value)}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                isRequired
                isDisabled={isPending}
                isInvalid={Boolean(errors.terms)}
              >
                <span className="flex flex-col gap-1">
                  <span className="text-red">
                    Required to operate your account
                  </span>
                  <span className="font-montreal text-base normal-case">
                    I agree to the{" "}
                    <Link href="/terms-of-use" {...legalLink}>
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy-policy" {...legalLink}>
                      Privacy Policy
                    </Link>
                    . My details are used to operate my account and verify my
                    submissions.
                  </span>
                </span>
              </Checkbox>
            )}
          />
          {errors.terms && (
            <AuthNote tone="error" role="alert">
              {errors.terms.message}
            </AuthNote>
          )}
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
                isDisabled={isPending}
                className="mt-4"
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
        </div>

        <Button
          type="submit"
          variant="solid"
          size="md"
          isLoading={isPending}
          disabled={isPending}
          className="w-full"
        >
          <HoverText text="Create account" />
        </Button>
        {error && (
          <AuthNote tone="error" role="alert">
            {error}
          </AuthNote>
        )}
      </form>
    </AuthLayout>
  );
}
