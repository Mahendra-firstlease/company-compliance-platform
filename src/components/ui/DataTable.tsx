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
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UISelect as Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/forms/Select";

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
  mobileCardRender?: (row: T) => React.ReactNode;
}

export default function DataTable<T>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search records...",
  defaultPageSize = 10,
  onRowClick,
  selectedRowId,
  getRowId,
  mobileCardRender,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

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
    globalFilterFn: (row: any, columnId: string, filterValue: string) => {
      const value = filterValue.toLowerCase().trim();
      if (searchKey) {
        const cellValue = String(row.getValue(searchKey) || "");
        return cellValue.toLowerCase().includes(value);
      }
      const cellValue = String(row.getValue(columnId) || "");
      return cellValue.toLowerCase().includes(value);
    },
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [searchQuery, table]);

  const pageState = table.getState().pagination;
  const filteredRowsCount = table.getFilteredRowModel().rows.length;
  
  const entryStart = filteredRowsCount === 0 ? 0 : pageState.pageIndex * pageState.pageSize + 1;
  const entryEnd = Math.min(filteredRowsCount, (pageState.pageIndex + 1) * pageState.pageSize);
  const totalPages = table.getPageCount();

  return (
    <div className="space-y-3 w-full">
      {/* 1. Top Toolbar (Entries Per Page & Search) */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Show</span>
          <Select
            value={String(pageState.pageSize)}
            onValueChange={(val: string) => table.setPageSize(Number(val))}
          >
            <SelectTrigger className="w-16 h-8 py-0 px-2 text-xs font-bold bg-slate-50">
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

        <div className="w-full sm:w-72">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={searchPlaceholder}
            size="sm"
          />
        </div>
      </div>

      {/* 2. Shadcn-Styled Datatable Frame */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden">
        {/* Desktop Table View (sm+) */}
        <div className="hidden sm:block overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-200">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup: any) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header: any, idx: number) => {
                    const originalCol = columns[idx];
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          originalCol?.align === "right" && "text-right",
                          originalCol?.align === "center" && "text-center"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ cursor: canSort ? "pointer" : "default" }}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-1.5 select-none",
                            originalCol?.align === "right" && "justify-end",
                            originalCol?.align === "center" && "justify-center"
                          )}
                        >
                          <span>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</span>
                          {canSort && (
                            <span className="shrink-0 text-slate-400">
                              {isSorted === "asc" ? (
                                <ArrowUp className="size-3 text-indigo-600 font-bold" />
                              ) : isSorted === "desc" ? (
                                <ArrowDown className="size-3 text-indigo-600 font-bold" />
                              ) : (
                                <ArrowUpDown className="size-3 opacity-50 hover:opacity-100" />
                              )}
                            </span>
                          )}
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
                      className={cn(onRowClick && "cursor-pointer hover:bg-indigo-50/20")}
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
                    className="text-center py-12 text-slate-400 font-semibold"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                      <div className="size-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <SearchX className="size-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">No matching records found</p>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        Try adjusting your search keyword or clearing active filters.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Stacked Cards View (< sm) */}
        <div className="sm:hidden divide-y divide-slate-100 p-2">
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row: any) => {
              if (mobileCardRender) {
                return (
                  <div
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row.original)}
                    className={cn(onRowClick && "cursor-pointer active:bg-slate-50")}
                  >
                    {mobileCardRender(row.original)}
                  </div>
                );
              }

              // Automatic default mobile card renderer
              const cells = row.getVisibleCells();
              return (
                <div
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className="p-3 space-y-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between font-bold text-xs text-slate-900 border-b border-slate-100 pb-2">
                    <div>{flexRender(cells[0]?.column.columnDef.cell, cells[0]?.getContext())}</div>
                    {cells.length > 1 && (
                      <div>{flexRender(cells[cells.length - 1]?.column.columnDef.cell, cells[cells.length - 1]?.getContext())}</div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    {cells.slice(1, cells.length - 1).map((cell: any, idx: number) => (
                      <div key={cell.id} className="space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          {columns[idx + 1]?.header}
                        </span>
                        <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              <SearchX className="size-6 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No matching records</p>
            </div>
          )}
        </div>

        {/* 3. Bottom Pagination Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3.5 border-t border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500">
          <div>
            Showing <span className="text-slate-900 font-bold">{entryStart}</span> to{" "}
            <span className="text-slate-900 font-bold">{entryEnd}</span> of{" "}
            <span className="text-slate-900 font-bold">{filteredRowsCount}</span> records
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="px-2.5 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              <ChevronLeft size={13} /> Prev
            </Button>

            <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold text-xs shadow-2xs">
              Page {pageState.pageIndex + 1} of {totalPages || 1}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="px-2.5 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Next <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
