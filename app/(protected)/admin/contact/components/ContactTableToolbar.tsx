"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type DataTableToolbarProps = {
  onClickAddButton: () => void;
};

export function ContactTableToolbar({ onClickAddButton }: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-end py-4 gap-2">
      <Button size="sm" onClick={onClickAddButton}>
        <Plus />
        Add Contact
      </Button>
    </div>
  );
}
