"use client";

import { ProductGrid } from "./product-grid";
import { useFeaturedProducts } from "@/hooks";

export function FeaturedProducts() {
  const { data, isLoading } = useFeaturedProducts(4);

  return (
    <ProductGrid
      products={data?.products ?? []}
      isLoading={isLoading}
      skeletonCount={4}
    />
  );
}
