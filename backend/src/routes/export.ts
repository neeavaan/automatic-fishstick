import type { FastifyPluginCallback } from 'fastify';
import ExcelJS from 'exceljs';
import type { Db } from '../db/database.js';

interface ExportPluginOptions {
  db: Db;
}

interface DbRecord {
  id: number;
  data: string;
  created_at: string;
}

export const exportRoutes: FastifyPluginCallback<ExportPluginOptions> = (app, { db }, done) => {
  app.get('/export', async (_request, reply) => {
    const rows = db
      .prepare('SELECT id, data, created_at FROM records ORDER BY id ASC')
      .all() as DbRecord[];

    if (rows.length === 0) {
      return reply.status(400).send({ error: 'No records to export' });
    }

    const records = rows.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      ...(JSON.parse(r.data) as Record<string, string>),
    }));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Records');

    const columns = Object.keys(records[0]);
    sheet.columns = columns.map((key) => ({
      header: key,
      key,
      width: 20,
    }));

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    for (const record of records) {
      sheet.addRow(record);
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return reply
      .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      .header('Content-Disposition', 'attachment; filename="export.xlsx"')
      .send(buffer);
  });

  done();
};
