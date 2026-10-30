import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

// The only file that knows about PGlite. To move to a hosted Postgres,
// replace this file and run db/schema.sql and db/seed.sql there.
const DATA_DIR = path.join(process.cwd(), ".data", "pglite");
const SQL_DIR = path.join(process.cwd(), "db");

async function open() {
  await mkdir(DATA_DIR, { recursive: true });
  const db = new PGlite(DATA_DIR);
  const run = async (file: string) =>
    db.exec(await readFile(path.join(SQL_DIR, file), "utf8"));
  const isEmpty = async (from: string) => {
    const { rows } = await db.query<{ count: number }>(
      `select count(*)::int as count from ${from}`,
    );
    return rows[0].count === 0;
  };

  await run("schema.sql");
  if (await isEmpty("users where is_mock")) await run("seed.sql");
  if (await isEmpty("products")) {
    await run("seed-products.sql");
    await run("seed-swipes.sql");
  }
  return db;
}

// Stored on globalThis so dev hot reloads reuse the one open database.
const store = globalThis as unknown as { grabbyDb?: Promise<PGlite> };

export async function query<T>(sql: string, params: unknown[] = []) {
  store.grabbyDb ??= open();
  const db = await store.grabbyDb;
  const { rows } = await db.query<T>(sql, params);
  return rows;
}
