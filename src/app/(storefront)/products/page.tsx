"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductGrid } from "@/components/product/product-grid";
import { useProducts, useCategories } from "@/hooks";
import type { ProductSortOption } from "@/types";

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A–Z" },
  { value: "name-desc", label: "Name: Z–A" },
  { value: "rating", label: "Top Rated" },
];

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState<ProductSortOption>("newest");
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useProducts({
    page,
    pageSize: 12,
    search: search || undefined,
    sortBy,
    categorySlug: categorySlug || undefined,
  });

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setSortBy("newest");
    setCategorySlug("");
    setPage(1);
  };

  const hasActiveFilters = search || categorySlug || sortBy !== "newest";
  const pagination = data?.pagination;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">All Products</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {pagination
            ? `Showing ${data.products.length} of ${pagination.totalItems} products`
            : "Browse our collection"}
        </p>
      </div>

      {/* Search & Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 sm:max-w-md sm:flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>

          <div className="hidden items-center gap-2 sm:flex">
            <Select
              value={categorySlug || "all"}
              onValueChange={(v) => { setCategorySlug(v === "all" ? "" : v); setPage(1); }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(c => !c.parentId).map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Filters */}
      {showFilters && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border bg-white p-4 sm:hidden">
          <Select
            value={categorySlug || "all"}
            onValueChange={(v) => { setCategorySlug(v === "all" ? "" : v); setPage(1); }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.filter(c => !c.parentId).map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(v) => { setSortBy(v as ProductSortOption); setPage(1); }}
          >
            <SelectTrigger>
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
      )}

      {/* Product Grid */}
      <ProductGrid
        products={data?.products ?? []}
        isLoading={isLoading}
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
