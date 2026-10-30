import { createHash } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

// The only file that knows about PGlite. To move to a hosted Postgres,
// replace this file and run the SQL_FILES there in order.
const DATA_DIR = path.join(process.cwd(), ".data", "pglite");
const SQL_DIR = path.join(process.cwd(), "db");
const SQL_FILES = ["schema.sql", "seed.sql", "seed-products.sql", "seed-swipes.sql", "seed-stores.sql"];

async function open() {
  await mkdir(DATA_DIR, { recursive: true });
  const db = new PGlite(DATA_DIR);

  const sql = await Promise.all(
    SQL_FILES.map(async (file) =>
      (await readFile(path.join(SQL_DIR, file), "utf8")).replace(/\r\n/g, "\n"),
    ),
  );
  const version = createHash("sha256").update(sql.join("\n")).digest("hex");

  // The local database is disposable: when the SQL files change, for example
  // after a git pull, rebuild it so nobody has to reset it by hand.
  await db.exec("create table if not exists seed_version (version text primary key)");
  const { rows } = await db.query("select 1 from seed_version where version = $1", [version]);
  if (rows.length === 0) {
    await db.transaction(async (tx) => {
      await tx.exec("drop schema public cascade; create schema public;");
      for (const statements of sql) await tx.exec(statements);
      await tx.exec("create table seed_version (version text primary key)");
      await tx.query("insert into seed_version (version) values ($1)", [version]);
    });
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
