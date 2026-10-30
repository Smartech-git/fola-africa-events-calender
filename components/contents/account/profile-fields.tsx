"use client";

import type { ReactNode } from "react";

import { Controller, type Control, type FieldPath } from "react-hook-form";

import Chip from "@/components/ui/chip";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { COUNTRY_OPTIONS } from "@/constants/countries";
import { INDUSTRIES, MEMBER_TYPES } from "@/payload/constants";
import type { ProfileValues } from "@/validations/member-account";

export interface CityOption {
  value: string;
  label: string;
}

interface Props {
  control: Control<ProfileValues>;
  cities: CityOption[];
  disabled?: boolean;
  /** Create Account puts the email beside the full name. */
  email?: ReactNode;
}

type TextField = Extract<
  FieldPath<ProfileValues>,
  "fullName" | "phone" | "organisation" | "role"
>;
type SelectField = Extract<
  FieldPath<ProfileValues>,
  "industry" | "city" | "country"
>;

/**
 * The Happenings profile: the same fields on Create Account and Profile.
 * They prefill About You on every submission.
 */
export default function ProfileFields({
  control,
  cities,
  disabled,
  email,
}: Props) {
  const text = (
    name: TextField,
    label: string,
    options: { required?: boolean; type?: string; autoComplete?: string } = {},
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          ref={field.ref}
          name={field.name}
          value={field.value}
          onValueChange={field.onChange}
          onBlur={field.onBlur}
          label={label}
          type={options.type ?? "text"}
          autoComplete={options.autoComplete}
          isRequired={options.required}
          isDisabled={disabled}
          isInvalid={fieldState.invalid}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );

  const select = (
    name: SelectField,
    label: string,
    options: { label: string; value: string }[],
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Select
          ref={field.ref}
          name={field.name}
          label={label}
          options={options}
          selectedKeys={field.value ? [field.value] : []}
          onSelectionChange={(keys) => {
            if (keys === "all") return;
            field.onChange(String(Array.from(keys)[0] ?? ""));
          }}
          onBlur={field.onBlur}
          isDisabled={disabled || !options.length}
          isInvalid={fieldState.invalid}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        {text("fullName", "Full name", {
          required: true,
          autoComplete: "name",
        })}
        {email}
        {text("phone", "Phone or WhatsApp number", {
          required: true,
          type: "tel",
          autoComplete: "tel",
        })}
        {text("organisation", "Organisation or company", {
          autoComplete: "organization",
        })}
        {text("role", "Job title or role", {
          autoComplete: "organization-title",
        })}
        {select("industry", "Industry", INDUSTRIES)}
        {select("city", "City", cities)}
        {select("country", "Country", COUNTRY_OPTIONS)}
      </div>

      <Controller
        control={control}
        name="describes"
        render={({ field, fieldState }) => (
          <fieldset className="flex flex-col gap-3">
            <legend className="pb-3 font-courier text-sm tracking-cou text-red uppercase">
              What best describes you?
            </legend>
            <div className="flex flex-wrap gap-2">
              {MEMBER_TYPES.map((type) => (
                <Chip
                  key={type.value}
                  isSelected={field.value === type.value}
                  disabled={disabled}
                  onClick={() =>
                    field.onChange(field.value === type.value ? "" : type.value)
                  }
                  onBlur={field.onBlur}
                >
                  {type.label}
                </Chip>
              ))}
            </div>
            {fieldState.error && (
              <p
                role="alert"
                className="font-courier text-xs tracking-cou text-red uppercase"
              >
                {fieldState.error.message}
              </p>
            )}
          </fieldset>
        )}
      />
    </>
  );
}
