"use client";

import { useQuery } from "@tanstack/react-query";
import type { CategoryWithCount, CategoryDetail } from "@/types";

export function useCategories() {
  return useQuery<{ categories: CategoryWithCount[] }>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });
}

export function useCategory(slug: string) {
  return useQuery<CategoryDetail>({
    queryKey: ["category", slug],
    queryFn: async () => {
      const res = await fetch(`/api/categories/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch category");
      return res.json();
    },
    enabled: !!slug,
  });
}
