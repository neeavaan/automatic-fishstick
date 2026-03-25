import { describe, it, expect } from 'vitest';
import { validateCsv } from '../utils/validateCsv.js';
import type { ParsedCsv } from '../types/csv.types.js';

const base: ParsedCsv = {
  headers: ['name', 'age'],
  rows: [{ name: 'Alice', age: '30' }],
  rowCount: 1,
  columnCount: 2,
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

  it('flags completely empty rows', () => {
    const errors = validateCsv({
      ...base,
      rows: [{ name: 'Alice', age: '30' }, { name: '', age: '' }],
      rowCount: 2,
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(3);
  });
});
