import type { FastifyPluginCallback } from 'fastify';
import type { Db } from '../db/database.js';

interface RecordsPluginOptions {
  db: Db;
}

interface RecordsQuery {
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
  search?: string;
}

interface DbRecord {
  id: number;
  row_hash: string;
  data: string;
  created_at: string;
}

export const recordsRoutes: FastifyPluginCallback<RecordsPluginOptions> = (app, { db }, done) => {
  app.get<{ Querystring: RecordsQuery }>('/records', (_request, reply) => {
    const page = Math.max(1, parseInt(_request.query.page ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(_request.query.pageSize ?? '20', 10)));
    const search = (_request.query.search ?? '').trim();
    const offset = (page - 1) * pageSize;

    let where = '';
    const params: unknown[] = [];

    if (search) {
      where = "WHERE data LIKE ? ESCAPE '\\'";
      params.push(`%${search.replace(/[%_\\]/g, '\\$&')}%`);
    }

    const total = (
      db.prepare(`SELECT COUNT(*) as count FROM records ${where}`).get(...params) as {
        count: number;
      }
    ).count;

    const rows = db
      .prepare(`SELECT id, data, created_at FROM records ${where} ORDER BY id DESC LIMIT ? OFFSET ?`)
      .all(...params, pageSize, offset) as Array<Pick<DbRecord, 'id' | 'data' | 'created_at'>>;

    const records = rows.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      ...(JSON.parse(r.data) as Record<string, string>),
    }));

    return reply.send({
      records,
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
