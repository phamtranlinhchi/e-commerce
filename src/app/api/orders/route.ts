// =============================================================================
// Orders API Routes - POST (create order), GET (list user orders)
// =============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createOrder, getUserOrders } from "@/lib/services";

// POST /api/orders - Create order from cart
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const order = await createOrder({
      userId: session.user.id,
      shippingAddress: body.shippingAddress,
      shippingAddressId: body.shippingAddressId,
      notes: body.notes,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create order";
    console.error("[ORDERS_POST]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET /api/orders - List user's orders
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 10)));

  const result = await getUserOrders(session.user.id, page, pageSize);
  return NextResponse.json(result);
}
