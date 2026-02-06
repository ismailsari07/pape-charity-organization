// ============================================
// SUBSCRIBER TYPES
// ============================================
export type SubscriberStatus = "active" | "inactive" | "unsubscribed";

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: SubscriberStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriberInput {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateSubscriberInput {
  name?: string;
  email?: string;
  phone?: string;
  status?: SubscriberStatus;
}

// ============================================
// EMAIL LOG TYPES
// ============================================
export type EmailDeliveryStatus = "pending" | "sent" | "delivered" | "bounced" | "failed" | "complained";

export interface EmailLog {
  id: string;
  subscriber_id: string;
  subject: string | null;
  resend_id: string | null;
  delivery_status: EmailDeliveryStatus;
  sent_at: string;
}

export interface CreateEmailLogInput {
  subscriber_id: string;
  subject: string;
  resend_id?: string;
  delivery_status?: EmailDeliveryStatus;
}

export interface UpdateEmailLogInput {
  delivery_status?: EmailDeliveryStatus;
  resend_id?: string;
}

// ============================================
// EMAIL EVENT TYPES
// ============================================
export type EmailEventType = "sent" | "delivered" | "bounced" | "complained" | "opened" | "clicked" | "unsubscribed";

export interface EmailEvent {
  id: string;
  email_log_id: string | null;
  resend_id: string | null;
  event_type: EmailEventType;
  event_data: Record<string, any> | null;
  created_at: string;
}

export interface CreateEmailEventInput {
  email_log_id?: string;
  resend_id?: string;
  event_type: EmailEventType;
  event_data?: Record<string, any>;
}

// ============================================
// JOINED TYPES (Relations için)
// ============================================
export interface EmailLogWithSubscriber extends EmailLog {
  subscriber: Subscriber;
}

export interface SubscriberWithStats extends Subscriber {
  total_emails_sent: number;
  last_email_sent_at: string | null;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SubscriberStats {
  total: number;
  active: number;
  inactive: number;
  unsubscribed: number;
}
