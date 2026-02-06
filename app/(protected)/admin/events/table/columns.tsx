"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { EventRow } from "../types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CopyIcon, Edit2, MoreHorizontal, Trash2 } from "lucide-react";

export function createEventColumns({
  onClickEditButton,
  onClickDeleteButton,
}: {
  onClickEditButton: (id: string) => void;
  onClickDeleteButton: (id: string) => void;
}): ColumnDef<EventRow>[] {
  return [
    {
      accessorKey: "title",
      header: "Etkinlik Adı",
    },
    {
      accessorKey: "day",
      header: "Gün/Tarih",
      cell: ({ row }) => {
        const event = row.original;

        return event.is_recurring ? row.getValue("day") : event.date;
      },
    },
    {
      accessorKey: "time",
      header: "Saat",
    },
    {
      accessorKey: "is_featured",
      header: "Öne Çıkan",
      cell: ({ row }) => {
        const isFeatured = row.getValue("is_featured");
        return isFeatured ? <Badge variant="success">Evet</Badge> : <Badge variant="neutral">Hayır</Badge>;
      },
    },
    {
      accessorKey: "is_active",
      header: "Aktif",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active");
        return isActive ? <Badge variant="success">Aktif</Badge> : <Badge variant="neutral">Pasif</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const event = row.original;

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="table" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(event.id)}>
                  <CopyIcon className="mr-2 h-4 w-4" />
                  Copy Event ID
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={() => onClickEditButton(event.id)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-400" onSelect={() => onClickDeleteButton(event.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];
}
