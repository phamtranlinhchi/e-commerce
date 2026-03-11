"use client";

import Link from "next/link";
import { ArrowRight, FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks";

export default function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const categories = data?.categories ?? [];
  const parentCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Categories</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Browse products by category
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {parentCategories.map((category) => {
            const subcategories = categories.filter((c) => c.parentId === category.id);
            return (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card className="group h-full border-0 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="flex h-full flex-col justify-between p-6">
                    <div>
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 transition-colors group-hover:bg-neutral-900 group-hover:text-white">
                        <FolderOpen className="h-5 w-5" />
                      </div>
                      <h2 className="text-lg font-semibold text-neutral-900">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      {subcategories.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {subcategories.map((sub) => (
                            <span
                              key={sub.id}
                              className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600"
                            >
                              {sub.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-neutral-500">
                        {category.productCount} products
                      </span>
                      <ArrowRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
