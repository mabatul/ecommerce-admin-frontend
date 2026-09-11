"use client";

import { useMemo, useState, type ReactNode } from "react";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  // Text this column contributes to the search filter. Omit for
  // action/computed columns that shouldn't be searchable.
  searchValue?: (row: T) => string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  searchPlaceholder?: string;
  pageSize?: number;
  emptyMessage?: string;
  actions?: (row: T) => ReactNode;
}

// Generic list view: search + pagination + loading/error/empty states,
// shared by every "view X" page (products, categories, users, carts,
// wishlists) instead of each one reimplementing the same table chrome.
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  loading = false,
  error = null,
  searchPlaceholder = "Search...",
  pageSize = 10,
  emptyMessage = "Nothing here yet.",
  actions,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const searchableColumns = useMemo(() => columns.filter((c) => c.searchValue), [columns]);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((row) =>
      searchableColumns.some((col) => col.searchValue!(row).toLowerCase().includes(q))
    );
  }, [rows, query, searchableColumns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      {searchableColumns.length > 0 && (
        <div className="mb-3">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none sm:w-64"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              {columns.map((col) => (
                <th key={col.header} className="px-4 py-2.5 font-medium">
                  {col.header}
                </th>
              ))}
              {actions && <th className="px-4 py-2.5 text-right font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-slate-400">
                  {query ? "No results match your search." : emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={rowKey(row)} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  {columns.map((col) => (
                    <td key={col.header} className="px-4 py-2.5 text-slate-800">
                      {col.cell(row)}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-2.5 text-right">{actions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <span>
            Page {currentPage} of {totalPages} ({filtered.length} result{filtered.length === 1 ? "" : "s"})
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 px-2.5 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-300 px-2.5 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
