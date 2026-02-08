import { NextRequest, NextResponse } from "next/server";
import { updateSubscriber, deleteSubscriber } from "@/lib/api/subscribers";
import { ZodError } from "zod";

// UPDATE subscriber
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const params = await props.params;
    const { name, email, phone, status } = body;

    const updated = await updateSubscriber(params.id, {
      name,
      email,
      phone,
      status,
    });

    if (!updated) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating subscriber:", error);

    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.flatten().fieldErrors }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update subscriber" }, { status: 500 });
  }
}

// DELETE subscriber
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const success = await deleteSubscriber(params.id);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Subscriber deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 });
  }
}
