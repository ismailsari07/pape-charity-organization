"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DonationFund } from "@/types/modules";
import { Switch } from "@/components/ui/switch";

type ColumnProps = {
  onToggleActive: (id: string, isActive: boolean) => void;
};

export function createDonationFundColumns({ onToggleActive }: ColumnProps): ColumnDef<DonationFund>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        return <div className="max-w-md">{row.original.description}</div>;
      },
    },
    {
      accessorKey: "is_active",
      header: "Active",
      cell: ({ row }) => {
        return (
          <Switch
            checked={row.original.is_active}
            onCheckedChange={(checked) => {
              onToggleActive(row.original.id, checked);
            }}
          />
        );
      },
    },
  ];
}
