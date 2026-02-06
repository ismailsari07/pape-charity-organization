"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Subscriber } from "../types/database.types";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit?: (subscriber: Subscriber) => void;
  onDelete?: (subscriber: Subscriber) => void;
  onSendEmail?: (subscriber: Subscriber) => void;
  onRowSelect?: (rows: Row<TData>[]) => void;
}

export function SubscribersTable<TData, TValue>({
  columns,
  data,
  onEdit,
  onDelete,
  onSendEmail,
  onRowSelect,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      onEdit,
      onDelete,
      onSendEmail,
    },
  });

  const prevSelectionRef = React.useRef<string>("");

  React.useEffect(() => {
    if (onRowSelect) {
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      const currentSelection = JSON.stringify(selectedRows.map((r) => r.id));

      // Only call onRowSelect if selection actually changed
      if (currentSelection !== prevSelectionRef.current) {
        prevSelectionRef.current = currentSelection;
        onRowSelect(selectedRows);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection, onRowSelect]);

  return (
    <div className="space-y-4">
      {/* Filters & Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by name or email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
          className="max-w-sm bg-neutral-900 border-neutral-800"
        />
        <Select
          value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) => table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-[180px] bg-neutral-900 border-neutral-800">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Selection Info */}
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <span>
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </span>
      </div>

      {/* Table */}
      <div className="rounded-md border border-neutral-800">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-neutral-800">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-neutral-400">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="border-neutral-800">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No subscribers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Total Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">Total: {table.getFilteredRowModel().rows.length} subscriber(s)</div>
      </div>
    </div>
  );
}
