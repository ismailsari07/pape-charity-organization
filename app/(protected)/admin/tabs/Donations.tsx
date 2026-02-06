"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllDonations, getDonationStats } from "@/lib/api/donations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "../components/data-table";
import { DataTableToolbar } from "../donations/components/data-table-toolbar";
import { columns } from "../donations/table/columns";
import { formatCurrency } from "../donations/helper";
import TabHeader from "../components/TabHeader";

export default function Donations() {
  const { data: donations = [], isLoading } = useQuery({
    queryKey: ["admin-donations"],
    queryFn: getAllDonations,
  });

  const { data: stats } = useQuery({
    queryKey: ["donation-stats"],
    queryFn: getDonationStats,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TabHeader title="Bağışlar" description="Stripe üzerinden yapılan tüm bağışlar." />

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Donations Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-neutral-400">Toplam Bağış Tutarı</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl text-neutral-50 font-semibold">{formatCurrency(stats.total, "CAD")}</p>
              </CardContent>
            </Card>
            {/* Total Donations Card */}

            {/* Donation Count */}
            <Card>
              <CardHeader>
                <CardTitle className="text-neutral-400"> Bağış Sayısı</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl text-neutral-50 font-semibold">{stats.count}</p>
              </CardContent>
            </Card>
            {/* Donation Count */}

            {/* Average Donation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-neutral-400">Ortalama Miktar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl text-neutral-50 font-semibold">
                  {formatCurrency(Math.round(stats.total / stats.count), "CAD")}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Zekat */}
            <Card>
              <CardHeader>
                <CardTitle className="text-neutral-400">Zekat Toplamı</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl text-neutral-50 font-semibold">{formatCurrency(stats.byFund.zekat, "CAD")}</p>
              </CardContent>
            </Card>
            {/* Zekat */}

            {/* Sadaka */}
            <Card>
              <CardHeader>
                <CardTitle className="text-neutral-400">Sadaka Toplamı</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl text-neutral-50 font-semibold">{formatCurrency(stats.byFund.sadaka, "CAD")}</p>
              </CardContent>
            </Card>
            {/* Sadaka */}

            {/* Kimsesizler Cenaze Fonu */}
            <Card>
              <CardHeader>
                <CardTitle className="text-neutral-400">Kimsesizler Cenaze Fonu Toplamı</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl text-neutral-50 font-semibold">{formatCurrency(stats.byFund.cenaze, "CAD")}</p>
              </CardContent>
            </Card>
            {/* Kimsesizler Cenaze Fonu */}

            {/* Cami Fonu Toplami */}
            <Card>
              <CardHeader>
                <CardTitle className="text-neutral-400">Cami Fonu Toplamı</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl text-neutral-50 font-semibold">{formatCurrency(stats.byFund.general, "CAD")}</p>
              </CardContent>
            </Card>
            {/* Cami Fonu Toplami */}
          </div>
        </>
      )}

      {/* Donations Table */}
      <DataTable columns={columns} data={donations} renderToolbar={(table) => <DataTableToolbar table={table} />} />
    </div>
  );
}
