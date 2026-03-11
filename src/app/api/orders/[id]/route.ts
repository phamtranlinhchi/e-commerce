// =============================================================================
// Order Detail API Route - GET single order by ID
// =============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrderById } from "@/lib/services";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/orders/[id] - Get order detail
export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrderById(id, session.user.id);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
