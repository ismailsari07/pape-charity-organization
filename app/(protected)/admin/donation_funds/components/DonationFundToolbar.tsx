"use client";

import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";

type Props = {
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
};

export function DonationFundToolbar({ hasChanges, isSaving, onSave }: Props) {
  return (
    <div className="flex justify-end mb-4">
      <Button size="sm" onClick={onSave} disabled={!hasChanges || isSaving}>
        <SaveIcon />
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
