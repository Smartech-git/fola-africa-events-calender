import { readFile } from "node:fs/promises";

import pg from "pg";

// One-time adoption of the original Users/Media schema created by Payload dev push.
// Verify it against the pre-change snapshot before changing migration metadata only.
const baseline = "20260917_100736_baseline";
const snapshot = JSON.parse(
  await readFile(
    new URL(`../migrations/${baseline}.json`, import.meta.url),
    "utf8",
  ),
);
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15000,
});
const db = await pool.connect();
try {
  await db.query("BEGIN");
  await db.query("SELECT pg_advisory_xact_lock(260917)");
  const columns = (
    await db.query(
      "SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public'",
    )
  ).rows;
  const indexes = (
    await db.query(
      "SELECT indexname FROM pg_indexes WHERE schemaname = 'public'",
    )
  ).rows.map((row) => row.indexname);
  const constraints = (
    await db.query(
      "SELECT constraint_name FROM information_schema.table_constraints WHERE table_schema = 'public'",
    )
  ).rows.map((row) => row.constraint_name);
  for (const table of Object.values(snapshot.tables) as any[]) {
    for (const column of Object.values(table.columns) as any[]) {
      const actual = columns.find(
        (row) =>
          row.table_name === table.name && row.column_name === column.name,
      );
      const type =
        column.type === "serial"
          ? "integer"
          : column.type === "varchar"
            ? "character varying"
            : column.type.replace(/\(\d+\)/g, "");
      if (
        !actual ||
        actual.data_type !== type ||
        (actual.is_nullable === "NO") !== column.notNull
      )
        throw new Error(`Baseline mismatch: ${table.name}.${column.name}`);
    }
    for (const name of Object.keys(table.indexes))
      if (!indexes.includes(name))
        throw new Error(`Baseline index missing: ${name}`);
    for (const name of Object.keys(table.foreignKeys))
      if (!constraints.includes(name))
        throw new Error(`Baseline constraint missing: ${name}`);
  }
  const existing = await db.query(
    "SELECT id FROM payload_migrations WHERE name = $1",
    [baseline],
  );
  if (!existing.rowCount) {
    const dev = await db.query(
      "SELECT id FROM payload_migrations WHERE name = 'dev' AND batch = -1",
    );
    if (dev.rowCount !== 1)
      throw new Error(
        "Expected one existing dev marker. Refusing to adopt an unknown migration history.",
      );
    await db.query(
      "UPDATE payload_migrations SET name = $1, batch = 0, updated_at = now() WHERE id = $2",
      [baseline, dev.rows[0].id],
    );
  }
  await db.query("COMMIT");
  console.log(
    "Existing Users/Media schema verified and adopted. No content records changed.",
  );
} catch (error) {
  await db.query("ROLLBACK");
  throw error;
} finally {
  db.release();
  await pool.end();
}
