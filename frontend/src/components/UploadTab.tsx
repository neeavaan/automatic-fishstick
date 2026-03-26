import React, { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileDropZone } from './FileDropZone.js';
import { CsvPreviewTable } from './CsvPreviewTable.js';
import { parseCsvFile } from '../utils/parseCsv.js';
import { validateCsv } from '../utils/validateCsv.js';
import { cn } from '../utils/cn.js';
import type { ParsedCsv, ValidationError, DuplicateStrategy, UploadResult } from '../types/csv.types.js';

type UploadStep = 'idle' | 'preview' | 'success';

async function uploadCsvFile(file: File, strategy: DuplicateStrategy): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`/api/upload?strategy=${strategy}`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const body = (await res.json()) as { error: string };
    throw new Error(body.error ?? 'Upload failed');
  }

  return res.json() as Promise<UploadResult>;
}

export const UploadTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<UploadStep>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<DuplicateStrategy>('skip');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const uploadMutation = useMutation({
    mutationFn: ({ file, strategy }: { file: File; strategy: DuplicateStrategy }) =>
      uploadCsvFile(file, strategy),
    onSuccess(result) {
      setUploadResult(result);
      setStep('success');
      void queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });

  const handleFile = useCallback(async (file: File) => {
    setParseError(null);
    setValidationErrors([]);
    setSelectedFile(file);

    try {
      const result = await parseCsvFile(file);
      const errors = validateCsv(result);
      setParsed(result);
      setValidationErrors(errors);
      setStep('preview');
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse CSV');
      setStep('idle');
    }
  }, []);

  const handleConfirmUpload = useCallback(() => {
    if (!selectedFile) return;
    uploadMutation.mutate({ file: selectedFile, strategy });
  }, [selectedFile, strategy, uploadMutation]);

  const handleReset = useCallback(() => {
    setStep('idle');
    setSelectedFile(null);
    setParsed(null);
    setValidationErrors([]);
    setParseError(null);
    setUploadResult(null);
    uploadMutation.reset();
  }, [uploadMutation]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 md:text-lg">Upload CSV</h2>
        <p className="mt-1 text-sm text-gray-500">
          Select a CSV file to import its records into the database.
        </p>
      </div>

      {step === 'idle' && (
        <>
          <FileDropZone onFile={handleFile} />
          {parseError && (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{parseError}</p>
          )}
        </>
      )}

      {step === 'preview' && parsed && (
        <div className="space-y-4">
          {/* File info */}
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{selectedFile?.name}</p>
              <p className="text-xs text-gray-500">
                {selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Change
            </button>
          </div>

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="rounded-md bg-red-50 px-4 py-3 space-y-1">
              <p className="text-sm font-medium text-red-700">Validation errors</p>
              <ul className="list-disc list-inside space-y-0.5">
                {validationErrors.map((e, i) => (
                  <li key={i} className="text-sm text-red-600">
                    {e.row != null ? `Row ${e.row}, ` : ''}
                    {e.column !== '*' ? `${e.column}: ` : ''}
                    {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview table */}
          <CsvPreviewTable parsed={parsed} />

          {/* Strategy + confirm */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="strategy" className="text-sm text-gray-700 whitespace-nowrap">
                Duplicate strategy:
              </label>
              <select
                id="strategy"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as DuplicateStrategy)}
                className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="skip">Skip duplicates</option>
                <option value="overwrite">Overwrite duplicates</option>
                <option value="append">Append all</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 sm:flex-none rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpload}
                disabled={validationErrors.length > 0 || uploadMutation.isPending}
                className={cn(
                  'flex-1 sm:flex-none rounded-md px-4 py-2 text-sm font-medium text-white min-h-[44px]',
                  validationErrors.length > 0 || uploadMutation.isPending
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700',
                )}
              >
                {uploadMutation.isPending ? 'Uploading…' : 'Confirm Upload'}
              </button>
            </div>
          </div>

          {uploadMutation.isError && (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {uploadMutation.error instanceof Error
                ? uploadMutation.error.message
                : 'Upload failed'}
            </p>
          )}
        </div>
      )}

      {step === 'success' && uploadResult && (
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-4">
            <p className="text-sm font-semibold text-green-800">Upload successful</p>
            <ul className="mt-2 space-y-1 text-sm text-green-700">
              <li>Inserted: {uploadResult.inserted}</li>
              {uploadResult.skipped > 0 && <li>Skipped (duplicates): {uploadResult.skipped}</li>}
              {uploadResult.overwritten > 0 && (
                <li>Overwritten: {uploadResult.overwritten}</li>
              )}
              <li>Total rows processed: {uploadResult.total}</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 min-h-[44px]"
          >
            Upload another file
          </button>
        </div>
      )}
    </div>
  );
};
