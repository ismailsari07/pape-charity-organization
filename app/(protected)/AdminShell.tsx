"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { signOut } from "@/lib/supabase/auth";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

const TABS = [
  { id: "events", label: "Events" },
  { id: "email", label: "Send Email" },
  { id: "donations", label: "Donations" },
  { id: "donation_funds", label: "Donation Funds" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuthStore();

  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "events";

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="min-h-screen mx-auto p-5 flex gap-3 overflow-y-scroll">
        {/* SideBar */}
        <div className="w-80 h-screen fixed flex flex-col items-start bg-neutral-900 border border-neutral-800/70 shadow rounded-lg p-5 text-neutral-50">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold">Turkish Islamic Trust</h1>
            <p className="font-semibol text-blue-600/90 mt-2">{user?.email}</p>
          </div>

          {/* Tabs */}
          <div className="w-full">
            {/* Tabs Header */}
            <div className="flex flex-col items-start gap-2 mb-4">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => router.push(`/admin?tab=${tab.id}`)}
                  className={`px-4 py-2 text-neutral-50 w-full text-start ${activeTab === tab.id ? "bg-neutral-50 text-neutral-900 rounded-lg font-semibold" : ""}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign Out
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-neutral-950 rounded-lg p-5 text-neutral-50 ml-80">{children}</div>
      </div>
    </div>
  );
}
