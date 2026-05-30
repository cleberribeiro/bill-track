import { createClient } from '@libsql/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDbPath = join(__dirname, '../data/billtrack.db');

function resolveUrl() {
  if (process.env.TURSO_DATABASE_URL) return process.env.TURSO_DATABASE_URL;
  const path = process.env.BILLTRACK_DB_PATH || defaultDbPath;
  return `file:${path}`;
}

export function createDatabase(url = resolveUrl()) {
  return createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export async function initializeSchema(database = db) {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS bills (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      amount       REAL NOT NULL DEFAULT 0,
      month_ref    TEXT NOT NULL,
      status       TEXT NOT NULL DEFAULT 'pending',
      sort_order   INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

const db = createDatabase();

export default db;
