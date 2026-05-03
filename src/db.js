import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDbPath = join(__dirname, '../data/billtrack.db');

export function initializeSchema(database) {
  database.exec(`
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

export function createDatabase(filename = process.env.BILLTRACK_DB_PATH || defaultDbPath) {
  const database = new Database(filename);
  initializeSchema(database);
  return database;
}

const db = createDatabase();

export default db;
