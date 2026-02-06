import { BulkEmailSendFormValues, EmailSendFormValues } from "@/app/(protected)/admin/email/schema/email.schema";

// ============================================
// SEND SINGLE EMAIL
// ============================================
// TODO: remove if not needed
export async function sendSingleEmail(payload: EmailSendFormValues) {
  try {
    const res = await fetch("api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Email gonderilemedi.");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// ============================================
// SEND BULK EMAIL
// ============================================
export async function sendBulkEmail(payload: BulkEmailSendFormValues): Promise<BulkEmailResponse> {
  try {
    const res = await fetch("api/send/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Email gonderilemedi.");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error sending bulk email:", error);
    throw error;
  }
}

// ============================================
// TYPES
// ============================================
// TODO: remove if not needed
export interface SendEmailResponse {
  success: boolean;
  sent: any;
  resendId?: string;
}

export interface BulkEmailResponse {
  success: boolean;
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    success: boolean;
    subscriber_id: string;
    email: string;
    resend_id?: string;
    error?: string;
  }>;
}
