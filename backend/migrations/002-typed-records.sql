-- Migrate from generic JSON blob to typed bank transaction columns.
-- Drops and recreates the records table with explicit schema.
DROP TABLE IF EXISTS records;

CREATE TABLE records (
  id                INTEGER      PRIMARY KEY AUTOINCREMENT,
  row_hash          TEXT         NOT NULL UNIQUE,
  kirjauspaiva      TEXT         NOT NULL,
  maksupaiva        TEXT         NOT NULL,
  summa             REAL         NOT NULL,
  tapahtumalaji     VARCHAR(255) NOT NULL,
  maksaja           VARCHAR(255) NOT NULL,
  saajan_nimi       VARCHAR(255) NOT NULL,
  saajan_tilinumero VARCHAR(255) NOT NULL,
  saajan_bic        VARCHAR(255) NOT NULL,
  viitenumero       VARCHAR(255) NOT NULL,
  viesti            VARCHAR(255) NOT NULL,
  arkistointitunnus VARCHAR(255) NOT NULL,
  created_at        TEXT         NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_records_kirjauspaiva ON records (kirjauspaiva);
