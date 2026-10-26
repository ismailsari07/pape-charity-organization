// The donation page's fund row (read in the browser by lib/api/funds.ts until
// the page moves to the server-side read in lib/server/funds.ts).
export type DonationFund = {
  id: string;
  slug: "zekat" | "sadaka" | "general" | "cenaze" | "fitre";
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
};
