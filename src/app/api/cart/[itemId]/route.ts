// =============================================================================
// Cart Item API Routes - PATCH/DELETE for individual cart items
// =============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ itemId: string }>;
}

// PATCH /api/cart/[itemId] - Update item quantity
export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;

  try {
    const { quantity } = await request.json();

    if (typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      await prisma.cartItem.deleteMany({
        where: { id: itemId, userId: session.user.id },
      });
      return NextResponse.json({ message: "Item removed" });
    }

    const item = await prisma.cartItem.updateMany({
      where: { id: itemId, userId: session.user.id },
      data: { quantity },
    });

    if (item.count === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Quantity updated" });
  } catch (error) {
    console.error("[CART_PATCH]", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

// DELETE /api/cart/[itemId] - Remove a single item
export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;

  const result = await prisma.cartItem.deleteMany({
    where: { id: itemId, userId: session.user.id },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Item removed" });
}
