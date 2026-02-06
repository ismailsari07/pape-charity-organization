import { NextRequest, NextResponse } from "next/server";
import { unsubscribeByEmail } from "@/lib/api/subscribers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    // Unsubscribe the email
    const success = await unsubscribeByEmail(email);

    if (!success) {
      return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
    }

    // Redirect to confirmation page
    return NextResponse.redirect(new URL(`/unsubscribe/success?email=${encodeURIComponent(email)}`, request.url));
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// POST method for Resend webhook
// TODO: Remove POST method if not needed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const success = await unsubscribeByEmail(email);

    if (!success) {
      return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Successfully unsubscribed" }, { status: 200 });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
