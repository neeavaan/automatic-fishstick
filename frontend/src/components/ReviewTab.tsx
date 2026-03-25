import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { cn } from '../utils/cn.js';

interface RecordsResponse {
  records: Record<string, string>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

async function fetchRecords(
  page: number,
  pageSize: number,
  search: string,
): Promise<RecordsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    ...(search ? { search } : {}),
  });
  const res = await fetch(`/api/records?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch records');
  return res.json() as Promise<RecordsResponse>;
}

async function clearAllRecords(): Promise<void> {
  const res = await fetch('/api/records', { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear records');
}

export const ReviewTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  // Debounce search
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    const t = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['records', page, debouncedSearch],
    queryFn: () => fetchRecords(page, 20, debouncedSearch),
  });

  const clearMutation = useMutation({
    mutationFn: clearAllRecords,
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: ['records'] });
      setConfirmClear(false);
      setPage(1);
    },
  });

  const columns = useMemo<ColumnDef<Record<string, string>>[]>(() => {
    if (!data?.records.length) return [];
    return Object.keys(data.records[0]).map((key) => ({
      accessorKey: key,
      header: key,
      cell: (info) => String(info.getValue() ?? ''),
    }));
  }, [data?.records]);

  const table = useReactTable({
    data: data?.records ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900 md:text-lg">Review Records</h2>
          {data && (
            <p className="text-sm text-gray-500">{data.total} record{data.total !== 1 ? 's' : ''} stored</p>
          )}
        </div>
        {(data?.total ?? 0) > 0 && (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="self-start sm:self-auto rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 min-h-[44px]"
          >
            Clear all data
          </button>
        )}
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Search records…"
        value={search}
        onChange={handleSearchChange}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 md:max-w-xs"
      />

      {/* Confirm clear dialog */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Clear all data?</h3>
            <p className="mt-2 text-sm text-gray-600">
              This will permanently delete all stored records. This action cannot be undone unless
              you re-upload the source CSV.
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 min-h-[44px] disabled:opacity-50"
              >
                {clearMutation.isPending ? 'Clearing…' : 'Yes, clear all'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading && <p className="text-sm text-gray-500 py-8 text-center">Loading…</p>}

      {isError && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load records.
        </p>
      )}

      {!isLoading && data?.records.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm font-medium text-gray-600">No records found</p>
          <p className="mt-1 text-sm text-gray-400">
            {debouncedSearch ? 'Try a different search term.' : 'Upload a CSV file to get started.'}
          </p>
        </div>
      )}

      {!isLoading && (data?.records.length ?? 0) > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          'whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-gray-600',
                          header.column.getCanSort() && 'cursor-pointer select-none hover:bg-gray-100',
                        )}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && ' ↑'}
                        {header.column.getIsSorted() === 'desc' && ' ↓'}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="whitespace-nowrap px-3 py-2 text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card layout */}
          <div className="md:hidden space-y-2">
            {table.getRowModel().rows.map((row) => (
              <div key={row.id} className="rounded-lg border border-gray-200 bg-white p-3 space-y-1">
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id} className="flex gap-2 text-sm">
                    <span className="font-medium text-gray-500 min-w-[100px] shrink-0">
                      {String(cell.column.columnDef.header)}
                    </span>
                    <span className="text-gray-700 break-all">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-500">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 min-h-[44px] min-w-[44px]"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 min-h-[44px] min-w-[44px]"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
