"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DonationWithFund, FundCode } from "../types";
import { formatCurrency } from "../helper";
import { formatDate } from "../helper";
import { formatTime } from "../helper";

export const columns: ColumnDef<DonationWithFund>[] = [
  {
    accessorKey: "created_at",
    header: "Bağış Tarihi",
    cell: ({ row }) => {
      const date = formatDate(row.getValue("created_at"));
      return <div>{date}</div>;
    },
  },
  {
    accessorKey: "time_created_at",
    header: "Bağış Saati",
    cell: ({ row }) => {
      const time = formatTime(row.getValue("created_at"));
      return <div>{time}</div>;
    },
  },
  {
    accessorKey: "donor_email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-md hover:bg-neutral-800 hover:text-neutral-50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "fund_code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-md hover:bg-neutral-800 hover:text-neutral-50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bağış Fonu
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const donation = row.original;
      const variants: Record<FundCode, "success" | "sky" | "yellow" | "blue" | "orange" | "neutral"> = {
        general: "success",
        cenaze: "blue",
        fitre: "sky",
        sadaka: "yellow",
        zekat: "orange",
        unassigned: "neutral",
      };
      return <Badge variant={variants[donation.donation_funds.slug]}>{donation.donation_funds.title}</Badge>;
    },
  },
  { accessorKey: "currency", header: "Para Birimi" },
  {
    accessorKey: "amount_cents",
    header: () => <div className="text-right">Bağış Miktarı</div>,
    cell: ({ row }) => {
      const donation = row.original;
      const amountCents = formatCurrency(donation.amount_cents, "CAD");
      const refund = donation.refunded_at
        ? "İade edildi"
        : donation.refunded_amount_cents
          ? `Kısmi iade: ${formatCurrency(donation.refunded_amount_cents, "CAD")}`
          : null;
      return (
        <div className="text-right">
          <span className={donation.refunded_at ? "line-through" : undefined}>{amountCents}</span>
          {refund && <div className="text-xs text-neutral-400">{refund}</div>}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const donation = row.original;

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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(donation.stripe_ref)}>
              Copy payment ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
