// =============================================================================
// Product Validators - Zod schemas for product-related inputs
// =============================================================================

import { z } from "zod";
import type { ProductSortOption } from "@/types";

const sortOptions: ProductSortOption[] = [
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
  "name-desc",
  "rating",
];

/** Validates query parameters for product listing API */
export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(48).default(12),
  search: z.string().trim().optional(),
  categorySlug: z.string().trim().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  isFeatured: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  sortBy: z
    .enum(sortOptions as [string, ...string[]])
    .default("newest")
    .transform((v) => v as ProductSortOption),
});

export type ProductQueryParams = z.infer<typeof productQuerySchema>;
