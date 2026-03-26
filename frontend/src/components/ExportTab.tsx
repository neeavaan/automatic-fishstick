import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '../utils/cn.js';

interface RecordCountResponse {
  total: number;
}

async function fetchRecordCount(): Promise<RecordCountResponse> {
  const res = await fetch('/api/records?page=1&pageSize=1');
  if (!res.ok) throw new Error('Failed to fetch record count');
  const data = (await res.json()) as { total: number };
  return { total: data.total };
}

async function triggerExport(): Promise<void> {
  const res = await fetch('/api/export');
  if (!res.ok) {
    const body = (await res.json()) as { error: string };
    throw new Error(body.error ?? 'Export failed');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'export.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const ExportTab: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const { data } = useQuery({
    queryKey: ['records', 1, ''],
    queryFn: fetchRecordCount,
  });

  const isEmpty = (data?.total ?? 0) === 0;

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      await triggerExport();
      setExportSuccess(true);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 md:text-lg">Export to Excel</h2>
        <p className="mt-1 text-sm text-gray-500">
          Download all stored records as an Excel (.xlsx) file.
        </p>
      </div>

      {data && (
        <p className="text-sm text-gray-600">
          <span className="font-medium">{data.total}</span> record{data.total !== 1 ? 's' : ''} available for export.
        </p>
      )}

      {exportSuccess && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3">
          <p className="text-sm font-medium text-green-800">Export successful</p>
          <p className="text-sm text-green-700">Your file has been downloaded.</p>
        </div>
      )}

      {exportError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{exportError}</p>
        </div>
      )}

      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleExport}
          disabled={isEmpty || isExporting}
          className={cn(
            'rounded-md px-6 py-3 text-sm font-medium text-white min-h-[44px] transition-colors',
            isEmpty || isExporting
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700',
          )}
          aria-disabled={isEmpty}
          title={isEmpty ? 'Upload records before exporting' : undefined}
        >
          {isExporting ? 'Generating…' : 'Export to Excel'}
        </button>
        {isEmpty && (
          <p className="mt-2 text-xs text-gray-500">
            No records available — upload a CSV first.
          </p>
        )}
      </div>
    </div>
  );
};
