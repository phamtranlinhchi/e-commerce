// =============================================================================
// Admin Categories API - GET (list), POST (create), PATCH (update), DELETE
// =============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminCategories } from "@/lib/services/admin";

// GET /api/admin/categories
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const categories = await getAdminCategories();
  return NextResponse.json(categories);
}

// POST /api/admin/categories - Create category
export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, slug, description, imageUrl, parentId, isActive, sortOrder } =
      body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 },
      );
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 },
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description ?? null,
        imageUrl: imageUrl ?? null,
        parentId: parentId ?? null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error("[ADMIN_CATEGORIES_POST]", err);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/categories - Update category (pass id in body)
export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { id, name, slug, description, imageUrl, parentId, isActive, sortOrder } =
      body;

    if (!id) {
      return NextResponse.json(
        { error: "Category id is required" },
        { status: 400 },
      );
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 409 },
        );
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(category);
  } catch (err) {
    console.error("[ADMIN_CATEGORIES_PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/categories
export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category id is required" },
        { status: 400 },
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ADMIN_CATEGORIES_DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
