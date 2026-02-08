"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import TabHeader from "../components/TabHeader";
import { BulkEmailSendFormValues, bulkEmailSendSchema } from "../email/schema/email.schema";
import { getSubscribers } from "@/lib/api/subscribers";
import { sendBulkEmail } from "@/lib/api/email";

// Custom Hook
import { useSubscriberSelection } from "../email/hooks/useSubscriberSelection";

// Components
import { EmailSendForm } from "../email/components/EmailSendForm";
import { SubscriberBadgeList } from "../email/components/SubscriberBadgeList";
import { SubscribersTableSection } from "../email/components/SubscribersTableSection";

/**
 * Email Send Component
 *
 * Main orchestrator for bulk email sending functionality.
 * Delegates logic to custom hooks and presentational components.
 *
 * Architecture:
 * - useSubscriberSelection: Manages table selection state
 * - EmailSendForm: Form UI (subject, title, description)
 * - SubscriberBadgeList: Displays selected recipients
 * - SubscribersTableSection: Subscriber table with filters
 */
export default function EmailSend() {
  // ============================================
  // DATA FETCHING
  // ============================================

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ["subscribers"],
    queryFn: getSubscribers,
  });

  // ============================================
  // SUBSCRIBER SELECTION (Custom Hook)
  // ============================================

  const selection = useSubscriberSelection(subscribers);

  // ============================================
  // FORM MANAGEMENT
  // ============================================

  const form = useForm<BulkEmailSendFormValues>({
    resolver: zodResolver(bulkEmailSendSchema) as any,
    defaultValues: {
      subject: "",
      title: "",
      description: "",
      subscriber_ids: [],
      send_to_all: false,
    },
  });

  // Sync form values with selection state
  useEffect(() => {
    const subscriber_ids = selection.sendToAll
      ? selection.activeSubscribers.map((s) => s.id)
      : selection.selectedSubscribers.map((s) => s.id);

    form.setValue("subscriber_ids", subscriber_ids, { shouldValidate: false });
    form.setValue("send_to_all", selection.sendToAll, { shouldValidate: false });
  }, [selection.selectedSubscribers, selection.sendToAll, selection.activeSubscribers, form]);

  // ============================================
  // EMAIL SENDING MUTATION
  // ============================================

  const bulkEmailSendMutation = useMutation({
    mutationFn: sendBulkEmail,
    onSuccess: (data) => {
      toast.success(`${data.successful} email başarıyla gönderildi!`);
      if (data.failed > 0) {
        toast.error(`${data.failed} email gönderilemedi.`);
      }

      // Reset form and selection
      form.reset();
      selection.handleClearAll();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (data: BulkEmailSendFormValues) => {
    bulkEmailSendMutation.mutate(data);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div>
      <TabHeader title="Email Send" description="Email gonderme islemleri" />

      {/* Form Section */}
      <EmailSendForm
        form={form}
        recipientCount={selection.recipientCount}
        isPending={bulkEmailSendMutation.isPending}
        onSubmit={handleSubmit}
      />

      {/* Badge List Section */}
      <SubscriberBadgeList
        selectedSubscribers={selection.selectedSubscribers}
        sendToAll={selection.sendToAll}
        recipientCount={selection.recipientCount}
        activeSubscribersCount={selection.activeSubscribers.length}
        onRemoveSubscriber={selection.handleRemoveSubscriber}
        onRemoveAll={selection.handleClearAll}
        onSelectAll={selection.handleSelectAll}
      />

      {/* Table Section */}
      <div className="mt-8">
        <SubscribersTableSection
          subscribers={subscribers}
          isLoading={isLoading}
          rowSelection={selection.rowSelection}
          onRowSelectionChange={selection.setRowSelection}
          onRowSelect={selection.handleRowSelect}
        />
      </div>
    </div>
  );
}
