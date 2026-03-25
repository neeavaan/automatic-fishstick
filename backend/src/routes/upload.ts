import type { FastifyPluginCallback } from 'fastify';
import { createHash } from 'crypto';
import type { Db } from '../db/database.js';

interface UploadPluginOptions {
  db: Db;
}

type DuplicateStrategy = 'skip' | 'overwrite' | 'append';

interface UploadBody {
  strategy?: DuplicateStrategy;
}

interface CsvRow {
  [key: string]: string;
}

export const uploadRoutes: FastifyPluginCallback<UploadPluginOptions> = (app, { db }, done) => {
  app.post<{ Querystring: UploadBody }>('/upload', async (request, reply) => {
    const strategy: DuplicateStrategy =
      (request.query.strategy as DuplicateStrategy | undefined) ?? 'skip';

    if (!['skip', 'overwrite', 'append'].includes(strategy)) {
      return reply.status(400).send({ error: 'Invalid duplicate strategy' });
    }

    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    if (!data.filename.endsWith('.csv')) {
      return reply.status(400).send({ error: 'Only .csv files are accepted' });
    }

    const csvText = await data.toBuffer().then((b) => b.toString('utf8'));

    const rows = parseCsv(csvText);
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

function parseCsv(text: string): CsvRow[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] ?? '').trim();
    });
    rows.push(row);
  }

  return rows;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function rowHash(row: CsvRow): string {
  return createHash('sha256').update(JSON.stringify(row)).digest('hex');
}

function insertRows(
  db: Db,
  rows: CsvRow[],
  strategy: DuplicateStrategy,
): { inserted: number; skipped: number; overwritten: number } {
  let inserted = 0;
  let skipped = 0;
  let overwritten = 0;

  const insertStmt = db.prepare(
    'INSERT OR IGNORE INTO records (row_hash, data) VALUES (?, ?)',
  );
  const upsertStmt = db.prepare(
    'INSERT INTO records (row_hash, data) VALUES (?, ?) ON CONFLICT(row_hash) DO UPDATE SET data = excluded.data',
  );
  const existsStmt = db.prepare('SELECT id FROM records WHERE row_hash = ?');

  const run = db.transaction((rows: CsvRow[]) => {
    for (const row of rows) {
      const hash = rowHash(row);
      const data = JSON.stringify(row);

      if (strategy === 'append') {
        // Append always inserts; use a unique hash per row+index to avoid conflicts
        const uniqueHash = createHash('sha256')
          .update(data + Date.now() + Math.random())
          .digest('hex');
        db.prepare('INSERT INTO records (row_hash, data) VALUES (?, ?)').run(uniqueHash, data);
        inserted++;
      } else if (strategy === 'skip') {
        const result = insertStmt.run(hash, data);
        if (result.changes > 0) {
          inserted++;
        } else {
          skipped++;
        }
      } else {
        // overwrite
        const existing = existsStmt.get(hash);
        const result = upsertStmt.run(hash, data);
        if (result.changes > 0 && !existing) {
          inserted++;
        } else {
          overwritten++;
        }
      }
    }
  });

  run(rows);

  return { inserted, skipped, overwritten };
}
