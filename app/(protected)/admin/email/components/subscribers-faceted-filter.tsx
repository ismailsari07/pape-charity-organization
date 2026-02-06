import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTableFacetedFilterProps<TData, TValue> {
  table?: any;
}

export default function SubscribersFacetedFilter<TData, TValue>({ table }: DataTableFacetedFilterProps<TData, TValue>) {
  return (
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
  );
}
