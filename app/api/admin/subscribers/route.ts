// app/api/admin/subscribers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSubscribers, getSubscriberStats } from "@/lib/api/subscribers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const getStats = searchParams.get("stats") === "true";

    // If stats requested
    if (getStats) {
      const stats = await getSubscriberStats();
      return NextResponse.json(stats);
    }

    // Get all subscribers
    const subscribers = await getSubscribers();

    return NextResponse.json({
      success: true,
      data: subscribers,
      total: subscribers.length,
    });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}
