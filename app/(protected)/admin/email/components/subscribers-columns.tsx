// app/(protected)/admin/email/components/subscribers-columns.tsx

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Subscriber } from "../types/database.types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, CopyIcon } from "lucide-react";
import { formatDistance } from "date-fns";
import { tr } from "date-fns/locale";

export const subscribersColumns: ColumnDef<Subscriber>[] = [
  {
    id: "select",
    header: (/*{ table }*/) => (
      // <Checkbox
      //   checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
      //   onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      //   aria-label="Select all"
      // />
      <></>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        disabled={row.original.status !== "active"}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      const variants: Record<string, "success" | "neutral" | "blue"> = {
        active: "success",
        inactive: "neutral",
        unsubscribed: "blue",
      };

      return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value === "" || row.getValue(id) === value;
    },
  },
  {
    accessorKey: "created_at",
    header: "Subscribed",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div>{formatDistance(date, new Date(), { addSuffix: true, locale: tr })}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const subscriber = row.original;
      // @ts-ignore - meta will be added in DataTable
      const { onDelete } = table.options.meta || {};

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="table" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(subscriber.email)}>
              <CopyIcon className="mr-2 h-4 w-4" />
              Copy email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
