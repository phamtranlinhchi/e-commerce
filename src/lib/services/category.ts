// =============================================================================
// Category Service - Database queries for categories
// =============================================================================

import { prisma } from "@/lib/prisma";
import type { CategoryWithCount, CategoryDetail } from "@/types";

export async function getCategories(): Promise<CategoryWithCount[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    imageUrl: cat.imageUrl,
    productCount: cat._count.products,
    parentId: cat.parentId,
  }));
}

export async function getCategoryBySlug(
  slug: string
): Promise<CategoryDetail | null> {
  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
    include: {
      _count: { select: { products: { where: { isActive: true } } } },
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { products: { where: { isActive: true } } } },
        },
      },
    },
  });

  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    productCount: category._count.products,
    parentId: category.parentId,
    children: category.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      description: child.description,
      imageUrl: child.imageUrl,
      productCount: child._count.products,
      parentId: child.parentId,
    })),
  };
}
