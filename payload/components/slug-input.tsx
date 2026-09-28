"use client";

import { useEffect, useRef } from "react";

import { TextField, useField, useFormFields } from "@payloadcms/ui";
import type { TextFieldClientProps } from "payload";

import { formatSlug } from "@/payload/fields/format-slug";

export function SlugInput({
  sourceField,
  ...props
}: TextFieldClientProps & { sourceField: string }) {
  const { value, initialValue, setValue } = useField<string>({ path: props.path });
  const source = useFormFields(([fields]) => fields[sourceField]?.value);
  const lastGenerated = useRef<string | undefined>(undefined);
  const manuallyEdited = useRef(false);

  useEffect(() => {
    if (props.readOnly || initialValue || manuallyEdited.current) return;
    if (value && value !== lastGenerated.current) {
      manuallyEdited.current = true;
      return;
    }
    if (typeof source !== "string") return;
    const next = formatSlug(source);
    lastGenerated.current = next;
    if (value !== next) setValue(next);
  }, [source, value, initialValue, setValue, props.readOnly]);

  return <TextField {...props} />;
}
