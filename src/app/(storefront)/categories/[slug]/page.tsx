"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductGrid } from "@/components/product/product-grid";
import { useCategory, useProducts } from "@/hooks";
import type { ProductSortOption } from "@/types";

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A–Z" },
  { value: "rating", label: "Top Rated" },
];

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug } = use(params);
  const { data: category, isLoading: catLoading } = useCategory(slug);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<ProductSortOption>("newest");

  const { data: productsData, isLoading: productsLoading } = useProducts({
    categorySlug: slug,
    page,
    pageSize: 12,
    sortBy,
  });

  if (catLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-2 h-4 w-32" />
        <Skeleton className="mb-2 h-9 w-64" />
        <Skeleton className="mb-8 h-4 w-96" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Category Not Found</h1>
        <p className="mt-2 text-neutral-500">This category doesn&apos;t exist.</p>
        <Button asChild className="mt-6">
          <Link href="/categories">Browse Categories</Link>
        </Button>
      </div>
    );
  }

  const pagination = productsData?.pagination;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          href="/categories"
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All Categories
        </Link>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-sm text-neutral-500">{category.description}</p>
        )}
      </div>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/categories/${child.slug}`}
              className="rounded-full border border-neutral-200 px-4 py-1.5 text-sm text-neutral-700 transition-colors hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
            >
              {child.name} ({child.productCount})
            </Link>
          ))}
        </div>
      )}

      {/* Sort */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          {pagination ? `${pagination.totalItems} products` : "Loading..."}
        </p>
        <Select
          value={sortBy}
          onValueChange={(v) => { setSortBy(v as ProductSortOption); setPage(1); }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products */}
      <ProductGrid
        products={productsData?.products ?? []}
        isLoading={productsLoading}
        skeletonCount={12}
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="px-4 text-sm text-neutral-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
