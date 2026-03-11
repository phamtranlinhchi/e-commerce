// =============================================================================
// Admin Order Detail API - GET (detail), PATCH (update status)
// =============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { OrderStatus } from "@/generated/prisma";

const validStatuses = new Set<string>(Object.values(OrderStatus));

// GET /api/admin/orders/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: true,
      shippingAddress: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

// PATCH /api/admin/orders/[id] - Update order status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const { status, paymentStatus, notes } = body;

    if (status && !validStatuses.has(status)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 },
      );
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status: status as OrderStatus }),
        ...(paymentStatus && { paymentStatus }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
        shippingAddress: true,
      },
    });

    return NextResponse.json(order);
  } catch (err) {
    console.error("[ADMIN_ORDERS_PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
