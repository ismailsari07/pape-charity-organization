import { useState, useCallback, useMemo } from "react";
import type { Row } from "@tanstack/react-table";
import type { Subscriber } from "../types/database.types";

/**
 * Custom hook for managing subscriber selection state
 *
 * Implements controlled component pattern for DataTable:
 * - Manages rowSelection state (checkbox states)
 * - Syncs with selectedSubscribers array
 * - Provides handlers for badge removal and bulk actions
 *
 * @param subscribers - Full list of subscribers from API
 * @returns Selection state and handler functions
 *
 * @example
 * const selection = useSubscriberSelection(subscribers);
 *
 * <DataTable
 *   rowSelection={selection.rowSelection}
 *   onRowSelectionChange={selection.setRowSelection}
 *   onRowSelect={selection.handleRowSelect}
 * />
 *
 * <Badge onClick={() => selection.handleRemoveSubscriber(id)} />
 */
export function useSubscriberSelection(subscribers: Subscriber[]) {
  // ============================================
  // STATE
  // ============================================

  // Table checkbox selection state (controlled)
  // Format: { "0": true, "2": true, "5": true }
  // Keys are row indices (not IDs!)
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Selected subscriber objects (derived from rowSelection)
  const [selectedSubscribers, setSelectedSubscribers] = useState<Subscriber[]>([]);

  // "Select All Active" mode
  const [sendToAll, setSendToAll] = useState(false);

  // ============================================
  // DERIVED VALUES (Memoized)
  // ============================================

  // Filter only active subscribers
  const activeSubscribers = useMemo(() => subscribers.filter((s) => s.status === "active"), [subscribers]);

  // Total recipient count
  const recipientCount = sendToAll ? activeSubscribers.length : selectedSubscribers.length;

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Called by DataTable when user selects/deselects rows
   * Updates selectedSubscribers array from table rows
   */
  const handleRowSelect = useCallback((rows: Row<Subscriber>[]) => {
    const selected = rows.filter((row) => row.original.status === "active").map((row) => row.original);

    setSelectedSubscribers(selected);
  }, []);

  /**
   * Remove individual subscriber (from badge X click)
   * Updates both selectedSubscribers and rowSelection
   */
  const handleRemoveSubscriber = useCallback(
    (id: string) => {
      // Step 1: Remove from selected list
      setSelectedSubscribers((prev) => prev.filter((s) => s.id !== id));

      // Step 2: Update table row selection
      // Note: TanStack Table uses row index (not ID) for selection
      const rowIndex = subscribers.findIndex((s) => s.id === id);

      if (rowIndex >= 0) {
        setRowSelection((prev) => {
          const { [rowIndex]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [subscribers],
  );

  /**
   * Select all active subscribers
   * Updates rowSelection to check all active rows
   */
  const handleSelectAll = useCallback(() => {
    setSendToAll(true);
    setSelectedSubscribers([]);

    // Update rowSelection to reflect all active subscribers
    const allActiveIndices = subscribers.reduce(
      (acc, s, index) => {
        if (s.status === "active") {
          acc[index] = true;
        }
        return acc;
      },
      {} as Record<string, boolean>,
    );

    setRowSelection(allActiveIndices);
  }, [subscribers]);

  /**
   * Clear all selections
   */
  const handleClearAll = useCallback(() => {
    setSendToAll(false);
    setSelectedSubscribers([]);
    setRowSelection({});
  }, []);

  // ============================================
  // RETURN API
  // ============================================

  return {
    // State
    rowSelection,
    setRowSelection,
    selectedSubscribers,
    sendToAll,
    recipientCount,
    activeSubscribers,

    // Handlers
    handleRowSelect,
    handleRemoveSubscriber,
    handleSelectAll,
    handleClearAll,
  };
}
