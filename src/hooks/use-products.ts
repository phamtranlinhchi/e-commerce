"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginatedProducts, Product, ProductListItem, ProductFilters } from "@/types";

function buildSearchParams(filters: ProductFilters & { page?: number; pageSize?: number }) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters.search) params.set("search", filters.search);
  if (filters.categorySlug) params.set("categorySlug", filters.categorySlug);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.isFeatured !== undefined) params.set("isFeatured", String(filters.isFeatured));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  return params;
}

export function useProducts(filters: ProductFilters & { page?: number; pageSize?: number } = {}) {
  return useQuery<PaginatedProducts>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const params = buildSearchParams(filters);
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });
}

export function useProduct(slug: string) {
  return useQuery<Product>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useFeaturedProducts(limit = 8) {
  return useQuery<{ products: ProductListItem[] }>({
    queryKey: ["products", "featured", limit],
    queryFn: async () => {
      const res = await fetch(`/api/products/featured?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch featured products");
      return res.json();
    },
  });
}
