#!/usr/bin/env node
// Applies any unapplied SQL files in supabase/migrations/ to the production
// database via the Supabase Management API, tracked in _applied_migrations.
// Runs in CI on every push to main (.github/workflows/migrate.yml).
// Env: SUPABASE_PAT (required), SUPABASE_PROJECT_REF (optional override).

import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PAT = process.env.SUPABASE_PAT;
const REF = process.env.SUPABASE_PROJECT_REF || "bbrcozoncbtemctamiaw";
if (!PAT) {
  console.error("SUPABASE_PAT is not set");
  process.exit(1);
}

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "supabase", "migrations");

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${PAT}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    throw new Error(`Management API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

await query(`CREATE TABLE IF NOT EXISTS _applied_migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);`);

const applied = new Set((await query("SELECT name FROM _applied_migrations;")).map((r) => r.name));
const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();

let ran = 0;
for (const file of files) {
  if (applied.has(file)) continue;
  const sql = await readFile(join(MIGRATIONS_DIR, file), "utf8");
  console.log(`Applying ${file}...`);
  await query(sql);
  await query(`INSERT INTO _applied_migrations (name) VALUES ('${file.replace(/'/g, "''")}');`);
  ran++;
}

if (ran > 0) {
  await query("NOTIFY pgrst, 'reload schema';");
  console.log(`Applied ${ran} migration(s); PostgREST schema cache reloaded.`);
} else {
  console.log("No pending migrations.");
}
