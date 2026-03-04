"use client";

// =============================================================================
// ProductCard - Reusable product card for catalog grids and carousels
// =============================================================================

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, getDiscountPercentage, truncateText } from "@/lib/format";
import { useCartStore } from "@/stores";
import type { ProductListItem } from "@/types";

interface ProductCardProps {
  product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const {
    name,
    slug,
    shortDescription,
    basePrice,
    compareAtPrice,
    primaryImage,
    reviewSummary,
    isFeatured,
  } = product;

  const discountPercent = compareAtPrice
    ? getDiscountPercentage(compareAtPrice, basePrice)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: `${product.id}-default`,
      productId: product.id,
      variantId: null,
      name: product.name,
      slug: product.slug,
      image: product.primaryImage,
      price: basePrice,
      quantity: 1,
      variant: null,
      maxStock: 99, // Will be fetched from server in production
    });
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image Container */}
      <Link href={`/products/${slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">
              <Eye className="h-12 w-12" />
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {isFeatured && (
              <Badge className="bg-amber-500 text-white hover:bg-amber-600 text-xs font-semibold shadow-sm">
                Featured
              </Badge>
            )}
            {discountPercent > 0 && (
              <Badge className="bg-rose-500 text-white hover:bg-rose-600 text-xs font-semibold shadow-sm">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {/* Quick action buttons - appear on hover */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-all duration-300 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
              onClick={handleAddToCart}
              aria-label={`Add ${name} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <CardContent className="p-4">
        {/* Category */}
        {product.category && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
            {product.category.name}
          </p>
        )}

        {/* Product Name */}
        <Link href={`/products/${slug}`}>
          <h3 className="mb-1.5 text-sm font-semibold text-neutral-900 line-clamp-1 transition-colors group-hover:text-neutral-700">
            {name}
          </h3>
        </Link>

        {/* Short Description */}
        {shortDescription && (
          <p className="mb-2 text-xs text-neutral-500 line-clamp-2">
            {truncateText(shortDescription, 80)}
          </p>
        )}

        {/* Rating */}
        {reviewSummary.totalReviews > 0 && (
          <div className="mb-2 flex items-center gap-1.5">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(reviewSummary.averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-neutral-200 text-neutral-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-neutral-500">
              ({reviewSummary.totalReviews})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-neutral-900">
            {formatPrice(basePrice)}
          </span>
          {compareAtPrice && compareAtPrice > basePrice && (
            <span className="text-sm text-neutral-400 line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
