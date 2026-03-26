import { describe, it, expect } from 'vitest';
import { validateCsv } from '../utils/validateCsv.js';
import { REQUIRED_COLUMNS } from '../types/csv.types.js';
import type { ParsedCsv } from '../types/csv.types.js';

const validRow = {
  'Kirjauspäivä': '10.03.2026',
  'Maksupäivä': '10.03.2026',
  'Summa': '-78',
  'Tapahtumalaji': 'TILISIIRTO',
  'Maksaja': 'MEIKÄLÄINEN MAIJA',
  'Saajan nimi': 'HSY',
  'Saajan tilinumero': 'FI49 5000 9420 0287 30',
  'Saajan BIC-tunnus': 'SBAN FI HH',
  'Viitenumero': '12360',
  'Viesti': "'-'",
  'Arkistointitunnus': '1234',
};

const base: ParsedCsv = {
  headers: [...REQUIRED_COLUMNS],
  rows: [validRow],
  rowCount: 1,
  columnCount: REQUIRED_COLUMNS.length,
};

describe('validateCsv', () => {
  it('returns no errors for valid CSV', () => {
    expect(validateCsv(base)).toHaveLength(0);
  });

  it('returns error when headers are empty', () => {
    const errors = validateCsv({ ...base, headers: [], columnCount: 0 });
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/no column headers/i);
  });

  it('returns error when no data rows', () => {
    const errors = validateCsv({ ...base, rows: [], rowCount: 0 });
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/no data rows/i);
  });

  it('flags a missing required column', () => {
    const errors = validateCsv({
      ...base,
      headers: REQUIRED_COLUMNS.filter((c) => c !== 'Summa'),
    });
    expect(errors.some((e) => e.column === 'Summa')).toBe(true);
  });

  it('flags non-numeric Summa', () => {
    const errors = validateCsv({
      ...base,
      rows: [{ ...validRow, Summa: 'abc' }],
    });
    expect(errors.some((e) => e.column === 'Summa')).toBe(true);
  });

  it('accepts comma-decimal Summa', () => {
    const errors = validateCsv({
      ...base,
      rows: [{ ...validRow, Summa: '-54,00' }],
    });
    expect(errors).toHaveLength(0);
  });
});
