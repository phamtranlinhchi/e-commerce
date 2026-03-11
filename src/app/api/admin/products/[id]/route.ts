// =============================================================================
// Admin Product Detail API - PATCH (update), DELETE (remove)
// =============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

// GET /api/admin/products/[id] - Get product details
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

// PATCH /api/admin/products/[id] - Update product
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();

    // Check product exists
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check slug uniqueness if changing
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: body.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "A product with this slug already exists" },
          { status: 409 },
        );
      }
    }

    const {
      name,
      slug,
      description,
      shortDescription,
      basePrice,
      compareAtPrice,
      costPrice,
      sku,
      barcode,
      weight,
      categoryId,
      isFeatured,
      isActive,
      metaTitle,
      metaDescription,
    } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(basePrice !== undefined && { basePrice }),
        ...(compareAtPrice !== undefined && { compareAtPrice }),
        ...(costPrice !== undefined && { costPrice }),
        ...(sku !== undefined && { sku }),
        ...(barcode !== undefined && { barcode }),
        ...(weight !== undefined && { weight }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isActive !== undefined && { isActive }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
      },
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("[ADMIN_PRODUCTS_PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ADMIN_PRODUCTS_DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete product. It may have existing orders." },
      { status: 500 },
    );
  }
}
