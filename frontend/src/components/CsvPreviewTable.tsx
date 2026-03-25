import React from 'react';
import type { ParsedCsv } from '../types/csv.types.js';

const PREVIEW_ROWS = 10;

interface CsvPreviewTableProps {
  readonly parsed: ParsedCsv;
}

export const CsvPreviewTable: React.FC<CsvPreviewTableProps> = ({ parsed }) => {
  const previewRows = parsed.rows.slice(0, PREVIEW_ROWS);

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        <span className="font-medium">{parsed.rowCount}</span> rows ·{' '}
        <span className="font-medium">{parsed.columnCount}</span> columns
        {parsed.rowCount > PREVIEW_ROWS && (
          <span className="text-gray-400"> · showing first {PREVIEW_ROWS} rows</span>
        )}
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {parsed.headers.map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-gray-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {previewRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {parsed.headers.map((h) => (
                  <td key={h} className="whitespace-nowrap px-3 py-2 text-gray-700">
                    {row[h]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
