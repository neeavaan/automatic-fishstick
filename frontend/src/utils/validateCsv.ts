import type { ParsedCsv, ValidationError } from '../types/csv.types.js';
import { REQUIRED_COLUMNS } from '../types/csv.types.js';

/**
 * Validates a parsed CSV against the required bank transaction schema.
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

  // Check required columns
  for (const col of REQUIRED_COLUMNS) {
    if (!parsed.headers.includes(col)) {
      errors.push({ column: col, message: `Required column "${col}" is missing` });
    }
  }

  if (errors.length > 0) return errors;

  // Validate Summa is numeric in every row
  parsed.rows.forEach((row, idx) => {
    const summaRaw = (row['Summa'] ?? '').replace(',', '.');
    if (summaRaw === '' || isNaN(parseFloat(summaRaw))) {
      errors.push({
        column: 'Summa',
        row: idx + 2,
        message: `Row ${idx + 2}: Summa "${row['Summa']}" is not a valid number`,
      });
    }
  });

  return errors;
}

