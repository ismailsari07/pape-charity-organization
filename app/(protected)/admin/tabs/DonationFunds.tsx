"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllDonationFunds, bulkUpdateDonationFunds } from "@/lib/api/funds";
import { DonationFund } from "@/types/modules";
import { DataTable } from "../components/data-table";
import { createDonationFundColumns } from "../donation_funds/components/donation-funds-columns";
import { DonationFundToolbar } from "../donation_funds/components/DonationFundToolbar";
import TabHeader from "../components/TabHeader";
import { toast } from "sonner";

export default function DonationFunds() {
  const queryClient = useQueryClient();

  const { data: funds = [], isLoading } = useQuery<DonationFund[]>({
    queryKey: ["admin-donation-funds"],
    queryFn: getAllDonationFunds,
  });

  const [localFunds, setLocalFunds] = useState<DonationFund[]>([]);
  const [changes, setChanges] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    setLocalFunds(funds);
  }, [funds]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = Array.from(changes.entries()).map(([id, is_active]) => ({
        id,
        is_active,
      }));
      return bulkUpdateDonationFunds(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-donation-funds"] });
      setChanges(new Map());
      toast.success("Changes saved successfully");
    },
    onError: () => {
      toast.error("Failed to save changes");
    },
  });

  const handleToggle = (id: string, isActive: boolean) => {
    setLocalFunds((prev) => prev.map((f) => (f.id === id ? { ...f, is_active: isActive } : f)));

    const original = funds.find((f) => f.id === id);
    const newChanges = new Map(changes);

    if (original && original.is_active === isActive) {
      newChanges.delete(id);
    } else {
      newChanges.set(id, isActive);
    }

    setChanges(newChanges);
  };

  const columns = createDonationFundColumns({
    onToggleActive: handleToggle,
  });

  if (isLoading) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <TabHeader
        title="Donation Fund Management"
        description="Configure and manage the donation categories available to your community. Enable or disable specific funds as needed."
      />

      <DonationFundToolbar
        hasChanges={changes.size > 0}
        isSaving={saveMutation.isPending}
        onSave={() => saveMutation.mutate()}
      />

      <DataTable columns={columns} data={localFunds} renderToolbar={() => null} />
    </div>
  );
}
