"use client";

import { useField, useFormFields } from "@payloadcms/ui";
import type { JSONFieldClientProps } from "payload";

import {
  displayValue,
  fieldLabel,
  type HappeningField,
} from "@/lib/account/happening-fields";
import styles from "@/payload/components/change-request-diff.module.css";

type Values = Record<string, unknown> | null | undefined;

/**
 * A change request's edits as a readable before → after table, in place of
 * the raw JSON. Times are the event city's wall times.
 */
export function ChangeRequestDiff({ path }: JSONFieldClientProps) {
  const { value } = useField<Values>({ path });
  const previous = useFormFields(
    ([fields]) => fields.previous?.value as Values,
  );
  const changes = value ?? {};
  const names = Object.keys(changes) as HappeningField[];

  return (
    <div className={styles.panel}>
      <h4 className={styles.title}>What the member changed</h4>
      {names.length ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Field</th>
              <th scope="col">Live now</th>
              <th scope="col">Proposed</th>
            </tr>
          </thead>
          <tbody>
            {names.map((name) => (
              <tr key={name}>
                <th scope="row">{fieldLabel(name)}</th>
                <td className={styles.before}>
                  {name === "artwork"
                    ? previous?.[name]
                      ? "Current image"
                      : "None"
                    : displayValue(name, previous?.[name]) || "—"}
                </td>
                <td>
                  {name === "artwork"
                    ? changes[name]
                      ? `New image (media ${String(changes[name])})`
                      : "Removed"
                    : displayValue(name, changes[name]) || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No changes recorded.</p>
      )}
      <p className={styles.note}>
        Approving copies the proposed values onto the live listing. Times are in
        the event’s city.
      </p>
    </div>
  );
}
