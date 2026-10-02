"use client";

import { useEffect, useRef } from "react";

import { Button, TextField, useField, useFormFields } from "@payloadcms/ui";
import type { TextFieldClientProps } from "payload";

import styles from "@/payload/components/slug-input.module.css";
import { formatSlug } from "@/payload/fields/format-slug";

export function SlugInput({
  sourceField,
  ...props
}: TextFieldClientProps & { sourceField: string }) {
  const { value, initialValue, setValue, disabled } = useField<string>({
    path: props.path,
  });
  const source = useFormFields(([fields]) => fields[sourceField]?.value);
  const lastGenerated = useRef<string | undefined>(undefined);
  const manuallyEdited = useRef(false);
  const generatedSlug = typeof source === "string" ? formatSlug(source) : "";
  const canGenerate = !props.readOnly && !disabled && Boolean(generatedSlug);

  useEffect(() => {
    if (props.readOnly || disabled || initialValue || manuallyEdited.current)
      return;
    if (value && value !== lastGenerated.current) {
      manuallyEdited.current = true;
      return;
    }
    if (typeof source !== "string") return;
    const next = formatSlug(source);
    lastGenerated.current = next;
    if (value !== next) setValue(next);
  }, [source, value, initialValue, setValue, props.readOnly, disabled]);

  return (
    <div className={styles.root}>
      <div className={styles.field}>
        <TextField {...props} />
      </div>
      <Button
        type="button"
        buttonStyle="secondary"
        size="small"
        margin={false}
        className={styles.action}
        disabled={!canGenerate}
        aria-label={`Generate slug from ${sourceField}`}
        onClick={() => {
          if (!canGenerate) return;
          lastGenerated.current = generatedSlug;
          manuallyEdited.current = false;
          setValue(generatedSlug);
        }}
      >
        Generate slug
      </Button>
    </div>
  );
}
