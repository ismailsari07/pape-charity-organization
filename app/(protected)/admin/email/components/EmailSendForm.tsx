import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { BulkEmailSendFormValues } from "../schema/email.schema";

interface EmailSendFormProps {
  form: UseFormReturn<BulkEmailSendFormValues>;
  recipientCount: number;
  isPending: boolean;
  onSubmit: (data: BulkEmailSendFormValues) => void;
}

/**
 * Email composition form
 *
 * Contains:
 * - Subject input
 * - Title input
 * - Description textarea
 * - Submit button
 */
export function EmailSendForm({ form, recipientCount, isPending, onSubmit }: EmailSendFormProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="my-5 flex flex-col gap-3">
      {/* Subject */}
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

      {/* Title */}
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

      {/* Description */}
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
        <p className="text-xs text-neutral-500 mt-1">İpucu: Mesajda [Name] yazarak abonenin ismiyle kişiselleştirin</p>
      </div>

      {/* Subscriber IDs Validation Error */}
      {form.formState.errors.subscriber_ids && (
        <p className="text-red-500 text-sm mt-1">{form.formState.errors.subscriber_ids.message}</p>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={isPending || recipientCount === 0} className="w-full">
        {isPending ? (
          "Gönderiliyor..."
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            {recipientCount} Kişiye Email Gönder
          </>
        )}
      </Button>
    </form>
  );
}
