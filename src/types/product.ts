// =============================================================================
// Product-related type definitions
// =============================================================================

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  isActive: boolean;
  attributes: Record<string, string>;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductReviewSummary {
  averageRating: number;
  totalReviews: number;
}

/** Core product type used across the storefront */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  sku: string | null;
  isFeatured: boolean;
  isActive: boolean;
  category: ProductCategory | null;
  images: ProductImage[];
  variants: ProductVariant[];
  reviewSummary: ProductReviewSummary;
  createdAt: string;
  updatedAt: string;
}

/** Lightweight product type for listings and cards */
export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  isFeatured: boolean;
  category: ProductCategory | null;
  primaryImage: ProductImage | null;
  reviewSummary: ProductReviewSummary;
}

/** Product filtering and sorting options */
export interface ProductFilters {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isFeatured?: boolean;
  sortBy?: ProductSortOption;
}

export type ProductSortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"
  | "rating";

/** Paginated product response */
export interface PaginatedProducts {
  products: ProductListItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
