export type Donation = {
  id: string;
  donor_email: string;
  amount_cents: number;
  currency: string;
  fund_code: FundCode;
  stripe_event_id: string;
  created_at: string;
};

export type DonationWithFund = Donation & {
  funds: {
    code: FundCode;
    label: string;
    color: string;
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

export type FundCode = "general" | "zekat" | "sadaka" | "cenaze" | "fitre";

export type DailyDonation = {
  date_only: string;
  zekat: number;
  sadaka: number;
  general: number;
  cenaze: number;
  fitre: number;
};
