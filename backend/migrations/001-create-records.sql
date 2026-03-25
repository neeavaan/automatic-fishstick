-- Creates the main records table.
-- row_hash is used for duplicate detection (SHA-256 hex of the raw CSV row).
CREATE TABLE IF NOT EXISTS records (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  row_hash   TEXT    NOT NULL UNIQUE,
  data       TEXT    NOT NULL,          -- JSON object keyed by column name
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_records_created_at ON records (created_at);
