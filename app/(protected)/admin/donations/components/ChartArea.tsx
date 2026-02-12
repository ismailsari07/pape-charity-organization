import * as React from "react";
import { Area, AreaChart, CartesianGrid, Legend, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DailyDonation } from "../types";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  zekat: {
    label: "Zekat",
    color: "var(--chart-1)",
  },
  sadaka: {
    label: "Sadaka",
    color: "var(--chart-2)",
  },
  cenaze: {
    label: "Cenaze",
    color: "var(--chart-3)",
  },
  general: {
    label: "Genel",
    color: "var(--chart-4)",
  },
  fitre: {
    label: "Fitre",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export default function ChartArea({ dailyDonation }: { dailyDonation: DailyDonation[] }) {
  const [timeRange, setTimeRange] = React.useState("90d");
  const [filteredData, setFilteredData] = React.useState<DailyDonation[]>([]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);

    let daysToSubtract = 90;
    if (value === "30d") {
      daysToSubtract = 30;
    } else if (value === "7d") {
      daysToSubtract = 7;
    }

    const referenceDate = new Date();
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const filtered = dailyDonation.filter((item: DailyDonation) => {
      const itemDate = new Date(item.date_only);
      return itemDate >= startDate;
    });

    setFilteredData(filtered);
  };

  // Initial load - component mount olunca
  React.useEffect(() => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const filtered = dailyDonation.filter((item: DailyDonation) => {
      const itemDate = new Date(item.date_only);
      return itemDate >= startDate;
    });

    setFilteredData(filtered);
  }, [dailyDonation]);

  const getDescription = () => {
    if (timeRange === "7d") return "Showing total donations for the last 7 days";
    if (timeRange === "30d") return "Showing total donations for the last 30 days";
    return "Showing total donations for the last 3 months";
  };

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Daily Donation</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[160px]" aria-label="Select a value">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[450px] w-full">
          <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillZekat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillSadaka" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillCenaze" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillGeneral" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillFitre" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-5)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-5)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date_only"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideIndicator={false}
                  indicator={"dot"}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
              }
            />
            <Area dataKey="zekat" type="natural" fill="url(#fillZekat)" stroke="var(--chart-1)" />
            <Area dataKey="sadaka" type="natural" fill="url(#fillSadaka)" stroke="var(--chart-2)" />
            <Area dataKey="cenaze" type="natural" fill="url(#fillCenaze)" stroke="var(--chart-3)" />
            <Area dataKey="general" type="natural" fill="url(#fillGeneral)" stroke="var(--chart-4)" />
            <Area dataKey="fitre" type="natural" fill="url(#fillFitre)" stroke="var(--chart-5)" />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "12px",
              }}
              iconType="circle"
              iconSize={12}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
