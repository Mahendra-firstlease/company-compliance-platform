"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef as TanStackColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "./table";
import Button from "@/components/common/Button";
import SearchBar from "@/components/common/SearchBar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UISelect as Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/forms/Select";

// Maintain backward-compatible ColumnDef interface
export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchKey?: string;
  searchPlaceholder?: string;
  defaultPageSize?: number;
  onRowClick?: (row: T) => void;
  selectedRowId?: string | null;
  getRowId?: (row: T) => string;
}

export default function DataTable<T>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search records...",
  defaultPageSize = 5,
  onRowClick,
  selectedRowId,
  getRowId,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  // Adapt backward-compatible ColumnDef into TanStack ColumnDef format
  const mappedColumns = useMemo<TanStackColumnDef<T>[]>(() => {
    return columns.map((col) => ({
      id: String(col.accessorKey || col.header),
      header: col.header,
      accessorFn: col.accessorKey
        ? (row: T) => (row as any)[col.accessorKey!]
        : undefined,
      cell: (info: any) => {
        if (col.cell) {
          return col.cell(info.row.original);
        }
        const val = info.getValue();
        return val !== undefined && val !== null ? String(val) : "";
      },
      meta: {
        align: col.align,
      },
    }));
  }, [columns]);

  const table = useReactTable({
    data,
    columns: mappedColumns,
    state: {
      sorting,
      globalFilter: searchQuery,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchQuery,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: getRowId,
    // Add custom filter logic if searchKey is passed
    globalFilterFn: (row: any, columnId: string, filterValue: string) => {
      const value = filterValue.toLowerCase().trim();
      if (searchKey) {
        const cellValue = String(row.getValue(searchKey) || "");
        return cellValue.toLowerCase().includes(value);
      }
      // Fallback search in all cell values
      const cellValue = String(row.getValue(columnId) || "");
      return cellValue.toLowerCase().includes(value);
    },
  });

  // Reset pagination to first page if query updates
  useEffect(() => {
    table.setPageIndex(0);
  }, [searchQuery, table]);

  // Read stats from TanStack state
  const pageState = table.getState().pagination;
  const filteredRowsCount = table.getFilteredRowModel().rows.length;
  
  const entryStart = filteredRowsCount === 0 ? 0 : pageState.pageIndex * pageState.pageSize + 1;
  const entryEnd = Math.min(filteredRowsCount, (pageState.pageIndex + 1) * pageState.pageSize);
  const totalPages = table.getPageCount();

  return (
    <div className="space-y-4 w-full">
      {/* 1. Table Top Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-t-2xl border border-slate-200 border-b-0 shadow-3xs">
        {/* Entries select wrapper */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Show</span>
          <Select
            value={String(pageState.pageSize)}
            onValueChange={(val: string) => table.setPageSize(Number(val))}
          >
            <SelectTrigger className="w-16 h-8 py-0 px-2 flex items-center justify-between text-xs font-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-16">
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {String(size)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>entries</span>
        </div>

        {/* Search Input bar */}
        <div className="w-full sm:w-72">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={searchPlaceholder}
          />
        </div>
      </div>

      {/* 2. Responsive Scroll Wrapper & Core Table */}
      <div className="bg-white border border-slate-200 rounded-b-2xl shadow-3xs overflow-hidden">
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup: any) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header: any, idx: number) => {
                    const originalCol = columns[idx];
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          originalCol?.align === "right" && "text-right",
                          originalCol?.align === "center" && "text-center"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}
                      >
                        <div className="flex items-center gap-1 select-none">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === "asc" ? " 🔼" : header.column.getIsSorted() === "desc" ? " 🔽" : null}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row: any) => {
                  const isSelected = selectedRowId !== undefined && selectedRowId === row.id;

                  return (
                    <TableRow
                      key={row.id}
                      className={cn(onRowClick && "cursor-pointer")}
                      data-state={isSelected ? "selected" : undefined}
                      onClick={() => onRowClick && onRowClick(row.original)}
                    >
                      {row.getVisibleCells().map((cell: any, idx: number) => {
                        const originalCol = columns[idx];
                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              originalCol?.align === "right" && "text-right",
                              originalCol?.align === "center" && "text-center"
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-12 text-slate-400 font-semibold italic"
                  >
                    No records found matching search filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 3. Table Bottom Footer Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500">
          <div>
            Showing <span className="text-slate-800 font-semibold">{entryStart}</span> to{" "}
            <span className="text-slate-800 font-semibold">{entryEnd}</span> of{" "}
            <span className="text-slate-800 font-semibold">{filteredRowsCount}</span> entries
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="p-1 px-2.5 text-xs font-semibold flex items-center gap-1"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              <ChevronLeft size={12} /> Previous
            </Button>

            <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs">
              {pageState.pageIndex + 1} / {totalPages || 1}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="p-1 px-2.5 text-xs font-semibold flex items-center gap-1"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Next <ChevronRight size={12} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
