"use client";

import { useSearchParams } from "next/navigation";
import Events from "./tabs/Events";
import Donations from "./tabs/Donations";
import EmailSend from "./tabs/EmailSend";
import DonationFunds from "./tabs/DonationFunds";
import ContactsTab from "./tabs/Contacts";
import AnnouncementsTab from "./tabs/Announcements";

export default function AdminClient() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "events";

  if (tab === "donations") return <Donations />;
  if (tab === "events") return <Events />;
  if (tab === "email") return <EmailSend />;
  if (tab === "donation_funds") return <DonationFunds />;
  if (tab === "contacts") return <ContactsTab />;
  if (tab === "announcement") return <AnnouncementsTab />;

  return <Events />;
}
