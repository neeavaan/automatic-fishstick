import Papa from 'papaparse';
import type { ParsedCsv, CsvRow } from '../types/csv.types.js';

export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      complete(results) {
        if (results.errors.length > 0) {
          reject(new Error(results.errors[0].message));
          return;
        }

        const headers = results.meta.fields ?? [];
        const rows = results.data;

        if (headers.length === 0) {
          reject(new Error('CSV has no headers'));
          return;
        }

        resolve({
          headers,
          rows,
          rowCount: rows.length,
          columnCount: headers.length,
        });
      },
      error(err) {
        reject(err);
      },
    });
  });
}
