export interface CsvRow {
  [key: string]: string;
}

export interface ParsedCsv {
  headers: readonly string[];
  rows: readonly CsvRow[];
  rowCount: number;
  columnCount: number;
}

export interface ValidationError {
  column: string;
  row?: number;
  message: string;
}

export interface UploadResult {
  inserted: number;
  skipped: number;
  overwritten: number;
  total: number;
}

export type DuplicateStrategy = 'skip' | 'overwrite' | 'append';
