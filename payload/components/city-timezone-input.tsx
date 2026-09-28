"use client";

import { useEffect, useRef } from "react";

import { TextField, useField, useFormFields } from "@payloadcms/ui";
import type { TextFieldClientProps } from "payload";

import { cityTimezone, timezoneLabel } from "@/payload/fields/city-timezone";

export function CityTimezoneInput(props: TextFieldClientProps) {
  const name = useFormFields(
    ([fields]) => (fields.name?.value as string) ?? "",
  );
  const country = useFormFields(
    ([fields]) => (fields.country?.value as string) ?? "",
  );
  const timezone = useFormFields(
    ([fields]) => (fields.timezone?.value as string) ?? "",
  );
  const { value, initialValue, setValue } = useField<string>({
    path: props.path,
  });
  const lastGenerated = useRef<string | undefined>(undefined);
  const next =
    props.path === "timezone"
      ? cityTimezone(name, country)
      : timezoneLabel(timezone);

  useEffect(() => {
    if (
      props.readOnly ||
      initialValue ||
      (value && value !== lastGenerated.current)
    )
      return;
    if (!next || value === next) return;
    lastGenerated.current = next;
    setValue(next);
  }, [next, value, initialValue, props.readOnly, setValue]);

  return <TextField {...props} />;
}
