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

export const REQUIRED_COLUMNS = [
  'Kirjauspäivä',
  'Maksupäivä',
  'Summa',
  'Tapahtumalaji',
  'Maksaja',
  'Saajan nimi',
  'Saajan tilinumero',
  'Saajan BIC-tunnus',
  'Viitenumero',
  'Viesti',
  'Arkistointitunnus',
] as const;
