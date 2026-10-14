export type Donation = {
  id: string;
  donor_email: string;
  amount_cents: number;
  currency: string;
  fund_code: FundCode;
  mode: "payment" | "subscription";
  stripe_ref: string;
  stripe_event_id: string | null;
  stripe_payment_intent: string | null;
  refunded_amount_cents: number | null;
  refunded_at: string | null;
  created_at: string;
};

export type DonationWithFund = Donation & {
  donation_funds: {
    slug: FundCode;
    title: string;
    color: string | null;
  };
};

export type DonationSummary = {
  total: number;
  count: number;
  byFund: Record<FundCode, number>;
};

export type Fund = {
  code: string;
  label: string;
  color: string;
  ramadan_only: boolean;
  is_active: boolean;
};

export type FundCode = "general" | "zekat" | "sadaka" | "cenaze" | "fitre" | "unassigned";

export type DailyDonation = {
  date_only: string;
  zekat: number;
  sadaka: number;
  general: number;
  cenaze: number;
  fitre: number;
};
