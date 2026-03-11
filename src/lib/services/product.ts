// =============================================================================
// Product Service - Database queries for products
// =============================================================================

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import type {
  Product,
  ProductListItem,
  ProductImage,
  ProductVariant,
  PaginatedProducts,
} from "@/types";
import type { ProductQueryParams } from "@/lib/validators";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Decimal = Prisma.Decimal;

function toNumber(d: Decimal | null | undefined): number {
  return d ? Number(d) : 0;
}

function toNumberOrNull(d: Decimal | null | undefined): number | null {
  return d ? Number(d) : null;
}

// Shared include for list queries (lightweight)
const listInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { id: true, url: true, altText: true, sortOrder: true, isPrimary: true },
  },
  reviews: { select: { rating: true } },
} satisfies Prisma.ProductInclude;

function serializeListItem(
  product: Prisma.ProductGetPayload<{ include: typeof listInclude }>
): ProductListItem {
  const reviews = product.reviews;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    basePrice: toNumber(product.basePrice),
    compareAtPrice: toNumberOrNull(product.compareAtPrice),
    isFeatured: product.isFeatured,
    category: product.category,
    primaryImage: product.images[0]
      ? {
          id: product.images[0].id,
          url: product.images[0].url,
          altText: product.images[0].altText,
          sortOrder: product.images[0].sortOrder,
          isPrimary: true,
        }
      : null,
    reviewSummary: {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    },
  };
}

// ---------------------------------------------------------------------------
// Build Prisma where/orderBy from query params
// ---------------------------------------------------------------------------

function buildWhere(params: ProductQueryParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (params.search) {
    where.name = { contains: params.search, mode: "insensitive" };
  }
  if (params.categorySlug) {
    where.category = { slug: params.categorySlug };
  }
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.basePrice = {};
    if (params.minPrice !== undefined) {
      where.basePrice.gte = params.minPrice;
    }
    if (params.maxPrice !== undefined) {
      where.basePrice.lte = params.maxPrice;
    }
  }
  if (params.isFeatured !== undefined) {
    where.isFeatured = params.isFeatured;
  }

  return where;
}

function buildOrderBy(
  sortBy: ProductQueryParams["sortBy"]
): Prisma.ProductOrderByWithRelationInput {
  switch (sortBy) {
    case "price-asc":
      return { basePrice: "asc" };
    case "price-desc":
      return { basePrice: "desc" };
    case "name-asc":
      return { name: "asc" };
    case "name-desc":
      return { name: "desc" };
    case "rating":
      return { reviews: { _count: "desc" } };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getProducts(
  params: ProductQueryParams
): Promise<PaginatedProducts> {
  const where = buildWhere(params);
  const orderBy = buildOrderBy(params.sortBy);
  const skip = (params.page - 1) * params.pageSize;

  const [totalItems, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: params.pageSize,
      include: listInclude,
    }),
  ]);

  return {
    products: products.map(serializeListItem),
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / params.pageSize),
    },
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        where: { isActive: true },
        orderBy: { price: "asc" },
      },
      reviews: {
        where: { isVisible: true },
        select: { rating: true },
      },
    },
  });

  if (!product) return null;

  const reviews = product.reviews;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    basePrice: toNumber(product.basePrice),
    compareAtPrice: toNumberOrNull(product.compareAtPrice),
    sku: product.sku,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    category: product.category,
    images: product.images.map(
      (img): ProductImage => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
      })
    ),
    variants: product.variants.map(
      (v): ProductVariant => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: toNumber(v.price),
        stock: v.stock,
        isActive: v.isActive,
        attributes: v.attributes as Record<string, string>,
      })
    ),
    reviewSummary: {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    },
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export async function getFeaturedProducts(
  limit: number = 8
): Promise<ProductListItem[]> {
  const products = await prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: listInclude,
  });

  return products.map(serializeListItem);
}
