"use client";

import { useEffect, useId, useRef, useState } from "react";

import {
  Button,
  SelectInput,
  useConfig,
  useField,
  useFormFields,
} from "@payloadcms/ui";
import type { JSONFieldClientProps, SelectFieldClientProps } from "payload";

import styles from "@/payload/components/relation-resolution.module.css";
import {
  parseRelationUpdate,
  relationUpdateFields,
  type RelationUpdatePlan,
  type SubmissionRelation,
} from "@/payload/submissions/relation-update";
import { relationID } from "@/payload/validation";

type ExistingRecord = {
  id: string | number;
  name: string;
  type?: string | null;
  website?: string | null;
  contact?: { email?: string | null };
  area?: string | null;
  address?: string | null;
  mapUrl?: string | null;
};

export function RelationUpdateData({ path }: JSONFieldClientProps) {
  useField({ path });
  return null;
}

export function RelationResolution({
  relation,
  ...props
}: SelectFieldClientProps & { relation: SubmissionRelation }) {
  const { value, setValue, disabled, showError, customComponents } =
    useField<string>({ path: props.path });
  const { value: storedPlan, setValue: setPlan } = useField<unknown>({
    path: `${relation}Update`,
  });
  const { value: linkedRecord, setValue: setRecord } = useField<unknown>({
    path: relation,
  });
  const fields = useFormFields(([fields]) => fields);
  const [open, setOpen] = useState(false);
  const prefix =
    relation === "organiser" ? "submittedOrganiser" : "submittedVenue";
  const submitted = Object.fromEntries(
    relationUpdateFields[relation].map(({ name }) => [
      name,
      fields[`${prefix}.${name}`]?.value ?? null,
    ]),
  );
  const plan = parseRelationUpdate(storedPlan, relation);
  const readOnly = props.readOnly || disabled;

  return (
    <div className={styles.root}>
      <SelectInput
        name={props.field.name}
        path={props.path}
        label={props.field.label}
        options={props.field.options.map((option) =>
          typeof option === "string"
            ? { label: option, value: option }
            : option,
        )}
        value={value}
        readOnly={readOnly}
        showError={showError}
        Error={customComponents?.Error}
        Label={customComponents?.Label}
        isClearable
        onChange={(option) => {
          if (readOnly) return;
          const next = option && !Array.isArray(option) ? option.value : null;
          if (next === "update-existing") setOpen(true);
          else {
            setValue(next);
            setPlan(null);
          }
        }}
      />
      {value === "update-existing" && (
        <div className={styles.summary}>
          <p>
            {plan && String(plan.recordId) === String(relationID(linkedRecord))
              ? `Update ${relation} #${plan.recordId} on approval: ${relationUpdateFields[
                  relation
                ]
                  .filter((field) => plan.fields.includes(field.name))
                  .map((field) => field.label)
                  .join(", ")}.`
              : "Choose the record and fields to update before approval."}
          </p>
          <Button
            type="button"
            size="small"
            margin={false}
            buttonStyle="secondary"
            disabled={readOnly}
            onClick={() => setOpen(true)}
          >
            Choose fields to update
          </Button>
        </div>
      )}
      {open && (
        <UpdateRecordModal
          relation={relation}
          city={relationID(fields.city?.value)}
          submitted={submitted}
          initialId={relationID(linkedRecord)}
          initialPlan={value === "update-existing" ? plan : null}
          disabled={Boolean(readOnly)}
          onClose={() => setOpen(false)}
          onConfirm={(next) => {
            setRecord(next.recordId);
            setPlan(next);
            setValue("update-existing");
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function UpdateRecordModal({
  relation,
  city,
  submitted,
  initialId,
  initialPlan,
  disabled,
  onClose,
  onConfirm,
}: {
  relation: SubmissionRelation;
  city?: string | number;
  submitted: Record<string, unknown>;
  initialId?: string | number;
  initialPlan: RelationUpdatePlan | null;
  disabled: boolean;
  onClose: () => void;
  onConfirm: (plan: RelationUpdatePlan) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { config } = useConfig();
  const collection = relation === "organiser" ? "organisers" : "venues";
  const api = `${config.routes.api}/${collection}`;
  const [search, setSearch] = useState(String(submitted.name || ""));
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<ExistingRecord[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(
    initialId ? String(initialId) : "",
  );
  const [selected, setSelected] = useState<ExistingRecord | null>(null);
  const [recordError, setRecordError] = useState("");
  const [checked, setChecked] = useState<string[]>(
    initialPlan && String(initialPlan.recordId) === String(initialId)
      ? initialPlan.fields
      : [],
  );

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        if (relation === "venue" && !city)
          throw new Error("Select the event's city before choosing a venue.");
        const query = new URLSearchParams({
          depth: "0",
          limit: "25",
          page: String(page),
          sort: "name",
          where: JSON.stringify({
            and: [
              { isDemo: { not_equals: true } },
              ...(relation === "venue" ? [{ city: { equals: city } }] : []),
              ...(search.trim() ? [{ name: { like: search.trim() } }] : []),
            ],
          }),
        });
        query.set("select[name]", "true");
        if (relation === "venue")
          for (const key of ["area", "address"])
            query.set(`select[${key}]`, "true");
        const response = await fetch(`${api}?${query}`, {
          signal: abort.signal,
          credentials: "same-origin",
        });
        if (!response.ok)
          throw new Error(
            "Unable to load records. Check your connection and administrator access.",
          );
        const result = await response.json();
        if (!abort.signal.aborted) {
          setRecords(result.docs);
          setHasNext(result.hasNextPage);
        }
      } catch (cause) {
        if (!abort.signal.aborted) {
          setError(
            cause instanceof Error ? cause.message : "Unable to load records.",
          );
          setRecords([]);
          setHasNext(false);
        }
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [api, city, page, relation, search]);

  useEffect(() => {
    const abort = new AbortController();
    setSelected(null);
    setRecordError("");
    if (selectedId) {
      const query = new URLSearchParams({ depth: "0" });
      for (const { name } of relationUpdateFields[relation])
        query.set(
          `select[${name === "contactEmail" ? "contact" : name}]`,
          "true",
        );
      query.set("select[isDemo]", "true");
      if (relation === "venue") query.set("select[city]", "true");
      void (async () => {
        try {
          const response = await fetch(
            `${api}/${encodeURIComponent(selectedId)}?${query}`,
            { signal: abort.signal, credentials: "same-origin" },
          );
          if (!response.ok)
            throw new Error(
              "Unable to load the selected record. Choose an available record.",
            );
          const record = await response.json();
          if (
            record.isDemo ||
            (relation === "venue" &&
              String(relationID(record.city)) !== String(city))
          )
            throw new Error("Choose a non-demo record in the event's city.");
          if (!abort.signal.aborted) setSelected(record);
        } catch (cause) {
          if (!abort.signal.aborted)
            setRecordError(
              cause instanceof Error
                ? cause.message
                : "Unable to load the selected record.",
            );
        }
      })();
    }
    return () => abort.abort();
  }, [api, city, relation, selectedId]);

  const options =
    selected &&
    !records.some((record) => String(record.id) === String(selected.id))
      ? [selected, ...records]
      : records;
  const display = (value: unknown) =>
    typeof value === "string" && value ? value : "(empty)";

  return (
    <dialog
      ref={dialog}
      className={styles.modal}
      aria-labelledby={titleId}
      onCancel={onClose}
      onKeyDown={(event) => {
        if (event.key === "Enter" && event.target instanceof HTMLInputElement)
          event.preventDefault();
      }}
    >
      <h2 id={titleId}>Update an existing {relation}</h2>
      <p>
        Choose the record and the submitted fields to copy. Updates apply when
        you approve or publish this event and affect all events using this
        shared record.
      </p>
      <label className={styles.label}>
        Search {collection}
        <input
          autoFocus
          className={styles.input}
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </label>
      <label className={styles.label}>
        Existing {relation}
        {relation === "venue" ? " in this city" : ""}
        <select
          className={styles.input}
          value={selectedId}
          disabled={disabled}
          onChange={(event) => {
            setSelectedId(event.target.value);
            setChecked([]);
          }}
        >
          <option value="">Select a record</option>
          {options.map((record) => (
            <option key={record.id} value={String(record.id)}>
              {record.name} — #{record.id}
              {relation === "venue"
                ? ` · ${[record.area, record.address].filter(Boolean).join(", ") || "No address saved"}`
                : ""}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.pagination}>
        <span role="status">
          {loading
            ? "Loading records…"
            : records.length
              ? `Page ${page}`
              : "No matches. Try a shorter name or clear the search."}
        </span>
        <Button
          type="button"
          size="small"
          margin={false}
          buttonStyle="secondary"
          disabled={loading || page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          size="small"
          margin={false}
          buttonStyle="secondary"
          disabled={loading || !hasNext}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
      {(error || recordError) && (
        <p className={styles.error} role="alert">
          {error || recordError}
        </p>
      )}
      {selectedId && !selected && !recordError && (
        <p role="status">Loading selected record…</p>
      )}
      {selected && (
        <fieldset className={styles.fields} disabled={disabled}>
          <legend>
            Fields to update on {selected.name} (#{selected.id})
          </legend>
          {relationUpdateFields[relation].map(({ name, label }) => {
            const current =
              name === "contactEmail"
                ? selected.contact?.email
                : selected[name as keyof ExistingRecord];
            return (
              <label key={name} className={styles.choice}>
                <input
                  type="checkbox"
                  checked={checked.includes(name)}
                  onChange={(event) =>
                    setChecked(
                      event.target.checked
                        ? [...checked, name]
                        : checked.filter((key) => key !== name),
                    )
                  }
                />
                <span>
                  <strong>{label}</strong>
                  <span className={styles.comparison}>
                    Saved: {display(current)}
                  </span>
                  <span className={styles.comparison}>
                    Submitted:{" "}
                    {submitted[name]
                      ? display(submitted[name])
                      : "Clear this value"}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>
      )}
      <div className={styles.actions}>
        <Button
          type="button"
          buttonStyle="secondary"
          margin={false}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          margin={false}
          disabled={disabled || !selected || !checked.length || !!recordError}
          onClick={() => {
            if (selected && checked.length && !disabled)
              onConfirm({ recordId: selected.id, fields: checked });
          }}
        >
          Select record and updates
        </Button>
      </div>
    </dialog>
  );
}
