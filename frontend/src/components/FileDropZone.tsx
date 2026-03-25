import React, { useCallback, useState } from 'react';
import { cn } from '../utils/cn.js';

interface FileDropZoneProps {
  readonly onFile: (file: File) => void;
  readonly disabled?: boolean;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onFile, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
      e.target.value = '';
    },
    [onFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile, disabled],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <label
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        'w-full rounded-lg border-2 border-dashed p-8 md:p-12',
        'cursor-pointer transition-colors',
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50',
        disabled && 'cursor-not-allowed opacity-50',
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <svg
        className="h-10 w-10 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          Drag &amp; drop a CSV file, or <span className="text-blue-600">browse</span>
        </p>
        <p className="mt-1 text-xs text-gray-500">Only .csv files are accepted</p>
      </div>
      <input
        type="file"
        accept=".csv"
        className="sr-only"
        onChange={handleFileInput}
        disabled={disabled}
      />
    </label>
  );
};
