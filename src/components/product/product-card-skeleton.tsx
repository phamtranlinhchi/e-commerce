// =============================================================================
// ProductCard Skeleton - Loading placeholder for product cards
// =============================================================================

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      {/* Image skeleton */}
      <Skeleton className="aspect-square w-full rounded-none" />

      <CardContent className="p-4">
        {/* Category */}
        <Skeleton className="mb-1 h-3 w-16" />
        {/* Name */}
        <Skeleton className="mb-1.5 h-4 w-3/4" />
        {/* Description */}
        <Skeleton className="mb-2 h-3 w-full" />
        {/* Rating */}
        <Skeleton className="mb-2 h-3.5 w-24" />
        {/* Price */}
        <Skeleton className="h-5 w-20" />
      </CardContent>
    </Card>
  );
}
