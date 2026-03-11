// =============================================================================
// Admin Products API - GET (list with filters), POST (create product)
// =============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminProducts } from "@/lib/services/admin";

// GET /api/admin/products - List products with filters
export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const result = await getAdminProducts({
    search: searchParams.get("search") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    isActive:
      searchParams.get("isActive") !== null
        ? searchParams.get("isActive") === "true"
        : undefined,
    isFeatured:
      searchParams.get("isFeatured") !== null
        ? searchParams.get("isFeatured") === "true"
        : undefined,
    page: Math.max(1, Number(searchParams.get("page") ?? 1)),
    pageSize: Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 20))),
  });

  return NextResponse.json(result);
}

// POST /api/admin/products - Create a new product
export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();

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
      images,
    } = body;

    if (!name || !slug || !description || basePrice === undefined) {
      return NextResponse.json(
        { error: "Name, slug, description, and basePrice are required" },
        { status: 400 },
      );
    }

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 409 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription: shortDescription ?? null,
        basePrice,
        compareAtPrice: compareAtPrice ?? null,
        costPrice: costPrice ?? null,
        sku: sku ?? null,
        barcode: barcode ?? null,
        weight: weight ?? null,
        categoryId: categoryId ?? null,
        isFeatured: isFeatured ?? false,
        isActive: isActive ?? true,
        metaTitle: metaTitle ?? null,
        metaDescription: metaDescription ?? null,
        images:
          images && images.length > 0
            ? {
                create: images.map(
                  (
                    img: { url: string; altText?: string; isPrimary?: boolean },
                    i: number,
                  ) => ({
                    url: img.url,
                    altText: img.altText ?? null,
                    sortOrder: i,
                    isPrimary: img.isPrimary ?? i === 0,
                  }),
                ),
              }
            : undefined,
      },
      include: {
        category: { select: { id: true, name: true } },
        images: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("[ADMIN_PRODUCTS_POST]", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
