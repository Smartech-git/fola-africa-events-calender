"use client";

import { useRef, useState, type ChangeEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@payloadcms/ui";

import { parseCsv, toCsv } from "@/lib/csv";
import styles from "@/payload/components/events-csv-import.module.css";
import {
  IMPORT_CHOICES,
  IMPORT_CHUNK,
  IMPORT_COLUMNS,
  IMPORT_STATUSES,
  MAX_IMPORT_ROWS,
  importTemplate,
  readImportRows,
  type ImportRow,
  type ImportStatus,
  type RowCheck,
  type RowResult,
} from "@/payload/imports/event-import-columns";

type Stage =
  | { name: "idle" }
  | { name: "checking" }
  | { name: "checked"; checks: RowCheck[] }
  | { name: "importing"; done: number; total: number }
  | { name: "done"; results: RowResult[]; importId?: number };

/** Saved with a byte-order mark so Excel opens accents correctly. */
function download(name: string, csv: string) {
  const url = URL.createObjectURL(
    new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

/** UTF-8 first; Excel's default "CSV" is Windows-1252. */
async function readText(file: File) {
  const buffer = await file.arrayBuffer();
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
}

async function post<T>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(endpoint, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(json?.errors?.[0]?.message ?? "The import failed.");
  return json as T;
}

export function EventsCsvImportPanel({
  endpoint,
  logPath,
}: {
  endpoint: string;
  logPath: string;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ImportStatus>("published");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [stage, setStage] = useState<Stage>({ name: "idle" });
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  const reset = () => {
    setStage({ name: "idle" });
    setRows([]);
    setFileName("");
    setError(undefined);
    setNotice(undefined);
    if (input.current) input.current.value = "";
  };

  const check = async (nextRows: ImportRow[], nextStatus: ImportStatus) => {
    setStage({ name: "checking" });
    setError(undefined);
    try {
      const { rows: checks } = await post<{ rows: RowCheck[] }>(endpoint, {
        mode: "check",
        status: nextStatus,
        rows: nextRows,
      });
      setStage({ name: "checked", checks });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The check failed.");
      setStage({ name: "idle" });
    }
  };

  const choose = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    reset();
    setFileName(file.name);
    const { rows: read, unknown } = readImportRows(
      parseCsv(await readText(file)),
    );
    if (!read.length) return setError("The file has no rows to import.");
    if (read.length > MAX_IMPORT_ROWS)
      return setError(
        `The file has ${read.length} rows. Split it into files of ${MAX_IMPORT_ROWS} rows or fewer.`,
      );
    if (unknown.length) setNotice(`Ignored columns: ${unknown.join(", ")}.`);
    setRows(read);
    await check(read, status);
  };

  const changeStatus = (next: ImportStatus) => {
    setStatus(next);
    // Notes on private listings depend on the status, so check again.
    if (rows.length) check(rows, next);
  };

  const importReady = async (checks: RowCheck[]) => {
    const ready = new Set(checks.filter((row) => row.ok).map((row) => row.row));
    const queue = rows.filter((row) => ready.has(row.row));
    const results: RowResult[] = [];
    let importId: number | undefined;
    setError(undefined);
    try {
      for (let start = 0; start < queue.length; start += IMPORT_CHUNK) {
        setStage({ name: "importing", done: start, total: queue.length });
        const response = await post<{
          importId: number;
          results: RowResult[];
        }>(endpoint, {
          mode: "import",
          status,
          fileName,
          importId,
          totalRows: rows.length,
          rows: queue.slice(start, start + IMPORT_CHUNK),
        });
        importId = response.importId;
        results.push(...response.results);
      }
    } catch (cause) {
      setError(
        `${cause instanceof Error ? cause.message : "The import stopped."} Rows already saved stay saved; check the import log before trying again.`,
      );
    }
    setStage({ name: "done", results, importId });
    router.refresh();
  };

  /** The rows that weren't saved, as in the file, with the reason last. */
  const downloadProblems = (problems: { row: number; reason: string }[]) => {
    const reasons = new Map(problems.map(({ row, reason }) => [row, reason]));
    download(
      `${fileName.replace(/\.csv$/i, "") || "events"}-not-imported.csv`,
      toCsv([
        [...IMPORT_COLUMNS.map(({ name }) => name), "problem"],
        ...rows
          .filter((row) => reasons.has(row.row))
          .map((row) => [
            ...IMPORT_COLUMNS.map(({ name }) => row.values[name] ?? ""),
            reasons.get(row.row)!,
          ]),
      ]),
    );
  };

  const busy = stage.name === "checking" || stage.name === "importing";

  return (
    <section className={styles.panel} aria-labelledby="events-csv-import">
      <div className={styles.head}>
        <div className={styles.text}>
          <h4 id="events-csv-import">Import events from CSV</h4>
          <p>
            Add many events at once. The file is checked first; nothing is saved
            until you import. Times are the city’s local time.
          </p>
        </div>
        <Button
          buttonStyle={open ? "secondary" : "primary"}
          size="small"
          margin={false}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          {open ? "Close" : "Import CSV"}
        </Button>
      </div>

      {open && (
        <div className={styles.body}>
          <div className={styles.controls}>
            <Button
              buttonStyle="secondary"
              size="small"
              margin={false}
              onClick={() => download("events-template.csv", importTemplate())}
            >
              Download template
            </Button>
            <label className={styles.field}>
              <span>Import as</span>
              <select
                value={status}
                disabled={busy}
                onChange={(event) =>
                  changeStatus(event.target.value as ImportStatus)
                }
              >
                {IMPORT_STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>CSV file</span>
              <input
                ref={input}
                type="file"
                accept=".csv,text/csv"
                disabled={busy}
                onChange={choose}
              />
            </label>
          </div>

          <details className={styles.help}>
            <summary>Columns and accepted values</summary>
            <ul>
              <li>
                Required: title, city, start_date, industry, event_type, access.
                Add start_time unless all_day is yes.
              </li>
              <li>
                Dates as YYYY-MM-DD, times as 24-hour HH:MM, in the city’s local
                time. Save the file as “CSV UTF-8” in Excel.
              </li>
              <li>
                Organisers and venues are matched by name. New ones are created.
              </li>
              <li>
                Give a source_url to update the same event on a later import
                instead of adding it again.
              </li>
              {IMPORT_CHOICES.map(({ column, options }) => (
                <li key={column}>
                  <strong>{column}:</strong>{" "}
                  {options.map((option) => option.label).join(", ")}
                  {column === "visibility" && " (blank: Full listing)"}
                </li>
              ))}
            </ul>
          </details>

          {notice && <p className={styles.note}>{notice}</p>}
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          {stage.name === "checking" && <p>Checking {rows.length} rows…</p>}
          {stage.name === "importing" && (
            <p role="status">
              Importing {stage.done} of {stage.total}…
            </p>
          )}

          {stage.name === "checked" && (
            <Report
              checks={stage.checks}
              status={status}
              onImport={() => importReady(stage.checks)}
              onProblems={() =>
                downloadProblems(
                  stage.checks
                    .filter((row) => !row.ok)
                    .map((row) => ({
                      row: row.row,
                      reason: row.errors.join(" "),
                    })),
                )
              }
              onReset={reset}
            />
          )}

          {stage.name === "done" && (
            <Done
              results={stage.results}
              logHref={
                stage.importId ? `${logPath}/${stage.importId}` : undefined
              }
              onProblems={() =>
                downloadProblems(
                  stage.results
                    .filter((result) => !result.ok)
                    .map((result) => ({
                      row: result.row,
                      reason: result.error ?? "Not saved.",
                    })),
                )
              }
              onReset={reset}
            />
          )}
        </div>
      )}
    </section>
  );
}

function Report({
  checks,
  status,
  onImport,
  onProblems,
  onReset,
}: {
  checks: RowCheck[];
  status: ImportStatus;
  onImport: () => void;
  onProblems: () => void;
  onReset: () => void;
}) {
  const ready = checks.filter((row) => row.ok).length;
  const problems = checks.length - ready;
  return (
    <>
      <p className={styles.summary} role="status">
        <strong>{ready} ready</strong>
        {problems > 0 && (
          <>
            {" · "}
            <span className={styles.error}>
              {problems} with problems (they won’t be imported)
            </span>
          </>
        )}
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Row</th>
              <th scope="col">Title</th>
              <th scope="col">City</th>
              <th scope="col">Result</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((row) => (
              <tr key={row.row} className={row.ok ? undefined : styles.bad}>
                <td>{row.row}</td>
                <td>{row.title || "—"}</td>
                <td>{row.city || "—"}</td>
                <td>
                  <strong>
                    {row.ok
                      ? row.action === "update"
                        ? "Update"
                        : "New"
                      : "Not imported"}
                  </strong>
                  <ul className={styles.messages}>
                    {row.errors.map((message) => (
                      <li key={message} className={styles.error}>
                        {message}
                      </li>
                    ))}
                    {row.notes.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.controls}>
        <Button
          buttonStyle="primary"
          size="small"
          margin={false}
          disabled={!ready}
          onClick={onImport}
        >
          {`Import ${ready} ${ready === 1 ? "event" : "events"} as ${status === "published" ? "Published" : "Submitted"}`}
        </Button>
        {problems > 0 && (
          <Button
            buttonStyle="secondary"
            size="small"
            margin={false}
            onClick={onProblems}
          >
            Download rows with problems
          </Button>
        )}
        <Button
          buttonStyle="secondary"
          size="small"
          margin={false}
          onClick={onReset}
        >
          Start over
        </Button>
      </div>
    </>
  );
}

function Done({
  results,
  logHref,
  onProblems,
  onReset,
}: {
  results: RowResult[];
  logHref?: string;
  onProblems: () => void;
  onReset: () => void;
}) {
  const created = results.filter((r) => r.ok && r.action === "create").length;
  const updated = results.filter((r) => r.ok && r.action === "update").length;
  const failed = results.filter((r) => !r.ok).length;
  return (
    <>
      <p className={styles.summary} role="status">
        <strong>
          {created} created · {updated} updated
        </strong>
        {failed > 0 && (
          <>
            {" · "}
            <span className={styles.error}>{failed} couldn’t be saved</span>
          </>
        )}
      </p>
      <div className={styles.controls}>
        {logHref && (
          <Link href={logHref} className={styles.link}>
            View the import log
          </Link>
        )}
        {failed > 0 && (
          <Button
            buttonStyle="secondary"
            size="small"
            margin={false}
            onClick={onProblems}
          >
            Download rows not imported
          </Button>
        )}
        <Button
          buttonStyle="secondary"
          size="small"
          margin={false}
          onClick={onReset}
        >
          Import another file
        </Button>
      </div>
    </>
  );
}
