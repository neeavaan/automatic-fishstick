import type { FastifyPluginCallback } from 'fastify';
import type { Db } from '../db/database.js';

interface RecordsPluginOptions {
  db: Db;
}

interface RecordsQuery {
  page?: string;
  pageSize?: string;
  search?: string;
}

interface DbRecord {
  id: number;
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
  created_at: string;
}

const SEARCH_COLUMNS = [
  'saajan_nimi', 'maksaja', 'tapahtumalaji',
  'viitenumero', 'viesti', 'arkistointitunnus',
] as const;

export const recordsRoutes: FastifyPluginCallback<RecordsPluginOptions> = (app, { db }, done) => {
  app.get<{ Querystring: RecordsQuery }>('/records', (_request, reply) => {
    const page = Math.max(1, parseInt(_request.query.page ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(_request.query.pageSize ?? '20', 10)));
    const search = (_request.query.search ?? '').trim();
    const offset = (page - 1) * pageSize;

    let where = '';
    const queryParams: (string | number)[] = [];

    if (search) {
      const pattern = `%${search.replace(/[%_\\]/g, '\\$&')}%`;
      where = `WHERE (${SEARCH_COLUMNS.map((c) => `${c} LIKE ? ESCAPE '\\'`).join(' OR ')})`;
      queryParams.push(...SEARCH_COLUMNS.map(() => pattern));
    }

    const total = (
      db.prepare(`SELECT COUNT(*) as count FROM records ${where}`).get(queryParams) as {
        count: number;
      }
    ).count;

    const rows = db
      .prepare(
        `SELECT id, kirjauspaiva, maksupaiva, summa, tapahtumalaji, maksaja,
                saajan_nimi, saajan_tilinumero, saajan_bic, viitenumero, viesti,
                arkistointitunnus, created_at
         FROM records ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      )
      .all([...queryParams, pageSize, offset]) as DbRecord[];

    return reply.send({
      records: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  });

  app.delete('/records', (_request, reply) => {
    db.prepare('DELETE FROM records').run();
    return reply.send({ deleted: true });
  });

  done();
};

