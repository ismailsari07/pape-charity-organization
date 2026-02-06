import { NextRequest, NextResponse } from "next/server";
import { createSubscriber } from "@/lib/api/subscribers";
import { subscribeSchema } from "@/app/(protected)/admin/email/schema/subscribe.schema";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = subscribeSchema.parse(body);

    // Create subscriber
    const subscriber = await createSubscriber({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone || undefined,
    });

    if (!subscriber) return NextResponse.json({ error: "Failed to create subscriber" }, { status: 500 });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed!",
        data: subscriber,
      },
      { status: 201 },
    );
  } catch (error) {
    // Zod validation error
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    // Duplicate email error
    if (error instanceof Error && error.message.includes("already subscribed")) {
      return NextResponse.json({ error: "This email is already subscribed" }, { status: 409 });
    }

    // Generic error
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
