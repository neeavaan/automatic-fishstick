import type { ParsedCsv, ValidationError } from '../types/csv.types.js';

/**
 * Validates a parsed CSV against the required schema.
 * Required columns and type rules are defined here and updated once the
 * output spec is confirmed (US-05 / US-12 are blocked pending schema clarification).
 *
 * Currently performs structural validation only (headers present, no empty rows).
 */
export function validateCsv(parsed: ParsedCsv): ValidationError[] {
  const errors: ValidationError[] = [];

  if (parsed.headers.length === 0) {
    errors.push({ column: '*', message: 'CSV has no column headers' });
    return errors;
  }

  if (parsed.rowCount === 0) {
    errors.push({ column: '*', message: 'CSV has no data rows' });
    return errors;
  }

  // Check for rows where all values are empty
  parsed.rows.forEach((row, idx) => {
    const allEmpty = Object.values(row).every((v) => v.trim() === '');
    if (allEmpty) {
      errors.push({ column: '*', row: idx + 2, message: 'Row is completely empty' });
    }
  });

  return errors;
}
