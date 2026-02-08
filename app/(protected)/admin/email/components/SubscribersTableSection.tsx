import { DataTable } from "../../components/data-table";
import { subscribersColumns } from "./subscribers-columns";
import SubscribersFacetedFilter from "./subscribers-faceted-filter";
import type { Subscriber } from "../types/database.types";
import type { Row } from "@tanstack/react-table";

interface SubscribersTableSectionProps {
  subscribers: Subscriber[];
  isLoading: boolean;
  rowSelection: Record<string, boolean>;
  onRowSelectionChange: (updater: any) => void;
  onRowSelect: (rows: Row<Subscriber>[]) => void;
}

/**
 * Subscribers table section
 *
 * Wraps DataTable with:
 * - Subscriber-specific columns
 * - Faceted filter toolbar
 * - Loading state
 */
export function SubscribersTableSection({
  subscribers,
  isLoading,
  rowSelection,
  onRowSelectionChange,
  onRowSelect,
}: SubscribersTableSectionProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-neutral-500">Yükleniyor...</div>;
  }

  return (
    <DataTable
      columns={subscribersColumns}
      data={subscribers}
      renderToolbar={(table) => <SubscribersFacetedFilter table={table} />}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      onRowSelect={onRowSelect}
    />
  );
}
