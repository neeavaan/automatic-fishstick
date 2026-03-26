import type { FastifyPluginCallback } from 'fastify';
import ExcelJS from 'exceljs';
import type { Db } from '../db/database.js';

interface ExportPluginOptions {
  db: Db;
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
}

const MONTH_NAMES = [
  'Tammikuu',  // 1
  'Helmikuu',  // 2
  'Maaliskuu', // 3
  'Huhtikuu',  // 4
  'Toukokuu',  // 5
  'Kesäkuu',   // 6
  'Heinäkuu',  // 7
  'Elokuu',    // 8
  'Syyskuu',   // 9
  'Lokakuu',   // 10
  'Marraskuu', // 11
  'Joulukuu',  // 12
] as const;

const ARIAL_10: Partial<ExcelJS.Font> = { name: 'Arial', size: 10 };
const AMOUNT_FMT = '#,##0.00';

// "DD.MM.YYYY" → 0-based month index (0 = January)
function parseMonthIndex(dateStr: string): number {
  const dot = dateStr.indexOf('.');
  const dot2 = dateStr.indexOf('.', dot + 1);
  if (dot < 0 || dot2 < 0) return -1;
  return parseInt(dateStr.slice(dot + 1, dot2), 10) - 1;
}

// Returns a stable-insertion-order map: label → per-month sums (0-indexed)
function groupByMonth(
  records: DbRecord[],
  labelFn: (r: DbRecord) => string,
  transformValue: (v: number) => number = (v) => v,
): Map<string, number[]> {
  const map = new Map<string, number[]>();
  for (const record of records) {
    const label = labelFn(record) || '(tuntematon)';
    const month = parseMonthIndex(record.kirjauspaiva);
    if (month < 0 || month > 11) continue;
    if (!map.has(label)) map.set(label, new Array(12).fill(0));
    map.get(label)![month] += transformValue(record.summa);
  }
  return map;
}

// col index (1-based) → column letter, works for A-Z
function colLetter(col: number): string {
  return String.fromCharCode(64 + col);
}

function writePivotRow(
  sheet: ExcelJS.Worksheet,
  rowNum: number,
  label: string,
  monthSums: number[],
): void {
  const row = sheet.getRow(rowNum);

  const cellA = row.getCell(1);
  cellA.value = label;
  cellA.font = ARIAL_10;

  for (let m = 0; m < 12; m++) {
    const cell = row.getCell(m + 2); // B=2 … M=13
    const val = monthSums[m];
    cell.value = val !== 0 ? Math.round(val * 100) / 100 : null;
    cell.font = ARIAL_10;
    cell.numFmt = AMOUNT_FMT;
  }

  const cellN = row.getCell(14);
  cellN.value = { formula: `SUM(B${rowNum}:M${rowNum})` };
  cellN.font = ARIAL_10;
  cellN.numFmt = AMOUNT_FMT;
}

function writeTotalRow(
  sheet: ExcelJS.Worksheet,
  rowNum: number,
  label: string,
  dataStartRow: number,
  dataEndRow: number,
): void {
  const row = sheet.getRow(rowNum);

  const cellA = row.getCell(1);
  cellA.value = label;
  cellA.font = { ...ARIAL_10, bold: true };

  for (let col = 2; col <= 13; col++) {
    const letter = colLetter(col);
    const cell = row.getCell(col);
    cell.value = { formula: `SUM(${letter}${dataStartRow}:${letter}${dataEndRow})` };
    cell.font = { ...ARIAL_10, bold: true };
    cell.numFmt = AMOUNT_FMT;
  }

  const cellN = row.getCell(14);
  cellN.value = { formula: `SUM(N${dataStartRow}:N${dataEndRow})` };
  cellN.font = { ...ARIAL_10, bold: true };
  cellN.numFmt = AMOUNT_FMT;
}

export const exportRoutes: FastifyPluginCallback<ExportPluginOptions> = (app, { db }, done) => {
  app.get('/export', async (_request, reply) => {
    const rows = db
      .prepare(
        `SELECT id, kirjauspaiva, maksupaiva, summa, tapahtumalaji, maksaja,
                saajan_nimi, saajan_tilinumero, saajan_bic, viitenumero, viesti,
                arkistointitunnus
         FROM records ORDER BY kirjauspaiva ASC, id ASC`,
      )
      .all() as DbRecord[];

    if (rows.length === 0) {
      return reply.status(400).send({ error: 'No records to export' });
    }

    const expenses = rows.filter((r) => r.summa < 0);
    const income = rows.filter((r) => r.summa >= 0);

    const expenseGroups = groupByMonth(expenses, (r) => r.saajan_nimi, (v) => -v);
    const incomeGroups = groupByMonth(income, (r) => r.maksaja);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tilinpäätös');

    // Set column widths
    sheet.getColumn(1).width = 30; // labels
    for (let col = 2; col <= 14; col++) {
      sheet.getColumn(col).width = 13;
    }

    // Row 1: spacer
    sheet.getRow(1).getCell(1).value = ' ';

    // Row 2: month header row
    const headerRow = sheet.getRow(2);
    headerRow.getCell(1).value = ' ';
    MONTH_NAMES.forEach((name, i) => {
      const cell = headerRow.getCell(i + 2);
      cell.value = name;
      cell.font = { ...ARIAL_10, bold: true };
    });
    const cellNHeader = headerRow.getCell(14);
    cellNHeader.value = 'Yhteensä';
    cellNHeader.font = { ...ARIAL_10, bold: true };

    // Expense rows starting at row 3
    const expenseStartRow = 3;
    let currentRow = expenseStartRow;

    for (const [payee, monthSums] of expenseGroups) {
      writePivotRow(sheet, currentRow, payee, monthSums);
      currentRow++;
    }

    // Yhteensä after expenses (only if there are expense rows)
    if (currentRow > expenseStartRow) {
      writeTotalRow(sheet, currentRow, 'Yhteensä', expenseStartRow, currentRow - 1);
      currentRow++;
    }

    // 4 gap rows
    currentRow += 4;

    // Tulot section header
    const tulotRowNum = currentRow;
    const tulotCell = sheet.getRow(tulotRowNum).getCell(1);
    tulotCell.value = 'Tulot';
    tulotCell.font = { ...ARIAL_10, bold: true };
    currentRow++;

    // Income rows
    const incomeStartRow = currentRow;

    for (const [sender, monthSums] of incomeGroups) {
      writePivotRow(sheet, currentRow, sender, monthSums);
      currentRow++;
    }

    // Yhteensä tuloja after income (only if there are income rows)
    if (currentRow > incomeStartRow) {
      writeTotalRow(sheet, currentRow, 'Yhteensä tuloja', incomeStartRow, currentRow - 1);
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return reply
      .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      .header('Content-Disposition', 'attachment; filename="tilinpaatos.xlsx"')
      .send(buffer);
  });

  done();
};

