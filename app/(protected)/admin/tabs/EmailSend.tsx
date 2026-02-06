"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import TabHeader from "../components/TabHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { BulkEmailSendFormValues, bulkEmailSendSchema } from "../email/schema/email.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { subscribersColumns } from "../email/components/subscribers-columns";
import { Subscriber } from "../email/types/database.types";
import { Badge } from "@/components/ui/badge";
import { X, Users, Send } from "lucide-react";
import { toast } from "sonner";
import { getSubscribers } from "@/lib/api/subscribers";
import { sendBulkEmail } from "@/lib/api/email";
import { DataTable } from "../components/data-table";
import SubscribersFacetedFilter from "../email/components/subscribers-faceted-filter";

export default function EmailSend() {
  const [selectedSubscribers, setSelectedSubscribers] = useState<Subscriber[]>([]);
  const [sendToAll, setSendToAll] = useState(false);

  // Fetch subscribers
  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ["subscribers"],
    queryFn: async () => {
      console.log("fetch baslasti.");
      return getSubscribers();
    },
  });

  const activeSubscribers = subscribers.filter((s: Subscriber) => s.status === "active");

  // Bulk email send mutation
  const bulkEmailSendMutation = useMutation({
    mutationFn: sendBulkEmail,
    onSuccess: (data) => {
      toast.success(`${data.successful} email başarıyla gönderildi!`);
      if (data.failed > 0) {
        toast.error(`${data.failed} email gönderilemedi.`);
      }
      // Reset form
      form.reset();
      setSelectedSubscribers([]);
      setSendToAll(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  console.log("ispending", bulkEmailSendMutation.isPending);

  const form = useForm<BulkEmailSendFormValues>({
    resolver: zodResolver(bulkEmailSendSchema),
    defaultValues: {
      subject: "",
      title: "",
      description: "",
      subscriber_ids: [],
      send_to_all: false,
    },
  });

  // Update subscriber_ids in form when selectedSubscribers or sendToAll changes
  useEffect(() => {
    const subscriber_ids = sendToAll
      ? activeSubscribers.map((s: Subscriber) => s.id)
      : selectedSubscribers.map((s) => s.id);

    form.setValue("subscriber_ids", subscriber_ids, { shouldValidate: false });
    form.setValue("send_to_all", sendToAll, { shouldValidate: false });
  }, [selectedSubscribers, sendToAll, activeSubscribers, form]);

  const handleSubmit = (data: BulkEmailSendFormValues) => {
    console.log("🔥 handleSubmit called!", data);
    bulkEmailSendMutation.mutate(data);
  };

  function handleSelectAll() {
    setSendToAll(true);
    setSelectedSubscribers([]);
  }

  function handleRemoveAll() {
    setSendToAll(false);
    setSelectedSubscribers([]);
  }

  function handleRemoveSubscriber(id: string) {
    setSelectedSubscribers((prev) => prev.filter((s) => s.id !== id));
  }

  // Get recipient count
  const recipientCount = sendToAll ? activeSubscribers.length : selectedSubscribers.length;

  return (
    <div>
      <TabHeader title="Email Send" description="Email gonderme islemleri" />

      <form onSubmit={form.handleSubmit(handleSubmit)} className="my-5 flex flex-col gap-3">
        <div>
          <Label>Subject</Label>
          <Input
            {...form.register("subject")}
            className="border-neutral-800 text-white bg-neutral-900"
            placeholder="Duyuru"
          />
          {form.formState.errors.subject && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.subject.message}</p>
          )}
        </div>

        <div>
          <Label>Title</Label>
          <Input
            {...form.register("title")}
            className="border-neutral-800 text-white bg-neutral-900"
            placeholder="Title"
          />
          {form.formState.errors.title && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            {...form.register("description")}
            className="border-neutral-800 text-white bg-neutral-900 min-h-[150px]"
            placeholder="Mesajınızı buraya yazın... ([Name] kullanarak kişiselleştirebilirsiniz)"
          />
          {form.formState.errors.description && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
          )}
          <p className="text-xs text-neutral-500 mt-1">
            İpucu: Mesajda [Name] yazarak abonenin ismiyle kişiselleştirin
          </p>
        </div>

        {/* Recipients Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Alıcılar ({recipientCount})</Label>
            <div className="flex gap-2">
              {!sendToAll && selectedSubscribers.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAll}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4 mr-1" />
                  Temizle
                </Button>
              )}
              <Button type="button" variant="outline" size="sm" onClick={handleSelectAll} disabled={sendToAll}>
                <Users className="w-4 h-4 mr-1" />
                Tüm Aktif Aboneler ({activeSubscribers.length})
              </Button>
            </div>
          </div>

          {/* Selected Recipients Badges */}
          <div className="flex flex-wrap items-center gap-2 min-h-14 p-3 border border-neutral-800 rounded-md bg-neutral-900">
            {sendToAll ? (
              <Badge variant="default" className="text-sm">
                <Users className="w-3 h-3 mr-1" />
                Everybody ({activeSubscribers.length})
                <button type="button" onClick={() => setSendToAll(false)} className="ml-2 hover:text-red-300">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ) : selectedSubscribers.length > 0 ? (
              selectedSubscribers.map((subscriber) => (
                <Badge key={subscriber.id} variant="secondary" className="text-sm">
                  {subscriber.name} ({subscriber.email})
                  <button
                    type="button"
                    onClick={() => handleRemoveSubscriber(subscriber.id)}
                    className="ml-2 hover:text-red-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-neutral-500 text-sm">
                Aşağıdaki tablodan abone seçin veya "Tüm Aktif Aboneler" butonuna tıklayın
              </span>
            )}
          </div>

          {/* Validation Error */}
          {form.formState.errors.subscriber_ids && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.subscriber_ids.message}</p>
          )}
        </div>

        <Button type="submit" disabled={bulkEmailSendMutation.isPending || recipientCount === 0} className="w-full">
          {bulkEmailSendMutation.isPending ? (
            "Gönderiliyor..."
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {recipientCount} Kişiye Email Gönder
            </>
          )}
        </Button>
      </form>

      {/* Subscribers Table */}
      <DataTable
        columns={subscribersColumns}
        data={subscribers}
        renderToolbar={(table) => <SubscribersFacetedFilter table={table} />}
      />
    </div>
  );
}
