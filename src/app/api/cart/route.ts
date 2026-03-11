// =============================================================================
// Cart API Routes - GET/POST for authenticated user's cart
// =============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/cart - Fetch current user's cart items
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          images: true,
        },
      },
      variant: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          attributes: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

// POST /api/cart - Add item to cart (or update quantity if exists)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId, variantId = null, quantity = 1 } = await request.json();

    if (!productId || quantity < 1) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Upsert: add or increment quantity
    const item = await prisma.cartItem.upsert({
      where: {
        userId_productId_variantId: {
          userId: session.user.id,
          productId,
          variantId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId: session.user.id,
        productId,
        variantId,
        quantity,
      },
      include: {
        product: {
          select: { id: true, name: true, slug: true, basePrice: true, images: true },
        },
        variant: {
          select: { id: true, name: true, price: true, stock: true, attributes: true },
        },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[CART_POST]", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

// DELETE /api/cart - Clear entire cart
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.cartItem.deleteMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ message: "Cart cleared" });
}
