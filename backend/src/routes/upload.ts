import type { FastifyPluginCallback } from 'fastify';
import { createHash } from 'crypto';
import type { Db } from '../db/database.js';

interface UploadPluginOptions {
  db: Db;
}

type DuplicateStrategy = 'skip' | 'overwrite' | 'append';

const REQUIRED_COLUMNS = [
  'Kirjauspäivä', 'Maksupäivä', 'Summa', 'Tapahtumalaji',
  'Maksaja', 'Saajan nimi', 'Saajan tilinumero', 'Saajan BIC-tunnus',
  'Viitenumero', 'Viesti', 'Arkistointitunnus',
] as const;

interface RecordRow {
  kirjauspaiva: string;
  maksupaiva: string;
  summa: number;
  tapahtumalaji: string;
  maksaja: string;
  saajan_nimi: string;
  saajan_tilinumero: string;
  saajan_bic: string;
  viitenumero: string;
  viesti: string;
  arkistointitunnus: string;
}

export const uploadRoutes: FastifyPluginCallback<UploadPluginOptions> = (app, { db }, done) => {
  app.post<{ Querystring: { strategy?: string } }>('/upload', async (request, reply) => {
    const strategy = (request.query.strategy ?? 'skip') as DuplicateStrategy;

    if (!['skip', 'overwrite', 'append'].includes(strategy)) {
      return reply.status(400).send({ error: 'Invalid duplicate strategy' });
    }

    const data = await request.file();
    if (!data) return reply.status(400).send({ error: 'No file uploaded' });
    if (!data.filename.endsWith('.csv')) {
      return reply.status(400).send({ error: 'Only .csv files are accepted' });
    }

    const csvText = await data.toBuffer().then((b) => b.toString('utf8'));
    const { rows, missingColumns } = parseCsv(csvText);

    if (missingColumns.length > 0) {
      return reply.status(400).send({
        error: `Missing required columns: ${missingColumns.join(', ')}`,
      });
    }

    if (rows.length === 0) {
      return reply.status(400).send({ error: 'CSV file is empty or has no data rows' });
    }

    const result = insertRows(db, rows, strategy);

    return reply.status(200).send({
      inserted: result.inserted,
      skipped: result.skipped,
      overwritten: result.overwritten,
      total: rows.length,
    });
  });

  done();
};

function parseCsv(text: string): { rows: RecordRow[]; missingColumns: string[] } {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean);
  if (lines.length < 2) return { rows: [], missingColumns: [] };

  const headers = lines[0].split(';').map((h) => h.trim());

  const missingColumns = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
  if (missingColumns.length > 0) return { rows: [], missingColumns };

  const rows: RecordRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';').map((v) => v.trim());
    const get = (col: string): string => values[headers.indexOf(col)] ?? '';

    const summa = parseFloat(get('Summa').replace(',', '.'));
    if (isNaN(summa)) continue;

    rows.push({
      kirjauspaiva: get('Kirjauspäivä'),
      maksupaiva: get('Maksupäivä'),
      summa,
      tapahtumalaji: get('Tapahtumalaji'),
      maksaja: get('Maksaja'),
      saajan_nimi: get('Saajan nimi'),
      saajan_tilinumero: get('Saajan tilinumero'),
      saajan_bic: get('Saajan BIC-tunnus'),
      viitenumero: get('Viitenumero'),
      viesti: get('Viesti'),
      arkistointitunnus: get('Arkistointitunnus'),
    });
  }

  return { rows, missingColumns: [] };
}

function rowHash(row: RecordRow): string {
  return createHash('sha256').update(JSON.stringify(row)).digest('hex');
}

function rowValues(hash: string, row: RecordRow): (string | number)[] {
  return [
    hash, row.kirjauspaiva, row.maksupaiva, row.summa,
    row.tapahtumalaji, row.maksaja, row.saajan_nimi,
    row.saajan_tilinumero, row.saajan_bic, row.viitenumero,
    row.viesti, row.arkistointitunnus,
  ];
}

const INSERT_SQL = `
  INSERT OR IGNORE INTO records
    (row_hash, kirjauspaiva, maksupaiva, summa, tapahtumalaji, maksaja,
     saajan_nimi, saajan_tilinumero, saajan_bic, viitenumero, viesti, arkistointitunnus)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const UPSERT_SQL = `
  INSERT INTO records
    (row_hash, kirjauspaiva, maksupaiva, summa, tapahtumalaji, maksaja,
     saajan_nimi, saajan_tilinumero, saajan_bic, viitenumero, viesti, arkistointitunnus)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(row_hash) DO UPDATE SET
    kirjauspaiva = excluded.kirjauspaiva, maksupaiva = excluded.maksupaiva,
    summa = excluded.summa, tapahtumalaji = excluded.tapahtumalaji,
    maksaja = excluded.maksaja, saajan_nimi = excluded.saajan_nimi,
    saajan_tilinumero = excluded.saajan_tilinumero, saajan_bic = excluded.saajan_bic,
    viitenumero = excluded.viitenumero, viesti = excluded.viesti,
    arkistointitunnus = excluded.arkistointitunnus
`;

function insertRows(
  db: Db,
  rows: RecordRow[],
  strategy: DuplicateStrategy,
): { inserted: number; skipped: number; overwritten: number } {
  let inserted = 0;
  let skipped = 0;
  let overwritten = 0;

  const insertStmt = db.prepare(INSERT_SQL);
  const upsertStmt = db.prepare(UPSERT_SQL);
  const existsStmt = db.prepare('SELECT id FROM records WHERE row_hash = ?');

  const run = db.transaction((rows: RecordRow[]) => {
    for (const row of rows) {
      const hash = rowHash(row);

      if (strategy === 'append') {
        const uniqueHash = createHash('sha256')
          .update(JSON.stringify(row) + Date.now() + Math.random())
          .digest('hex');
        db.prepare(INSERT_SQL).run(rowValues(uniqueHash, row));
        inserted++;
      } else if (strategy === 'skip') {
        const result = insertStmt.run(rowValues(hash, row));
        if (result.changes > 0) inserted++; else skipped++;
      } else {
        const existing = existsStmt.get(hash);
        upsertStmt.run(rowValues(hash, row));
        if (existing) overwritten++; else inserted++;
      }
    }
  });

  run(rows);
  return { inserted, skipped, overwritten };
}
