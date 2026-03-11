"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatPrice, getDiscountPercentage } from "@/lib/format";
import { useProduct } from "@/hooks";
import { useCartStore } from "@/stores";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = use(params);
  const { data: product, isLoading, error } = useProduct(slug);
  const addItem = useCartStore((s) => s.addItem);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) return <ProductDetailSkeleton />;
  if (error || !product) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Product Not Found</h1>
        <p className="mt-2 text-neutral-500">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const activeVariant = selectedVariant
    ? product.variants.find((v) => v.id === selectedVariant)
    : null;
  const currentPrice = activeVariant?.price ?? product.basePrice;
  const discountPercent = product.compareAtPrice
    ? getDiscountPercentage(product.compareAtPrice, currentPrice)
    : 0;

  const handleAddToCart = () => {
    addItem({
      id: activeVariant ? `${product.id}-${activeVariant.id}` : `${product.id}-default`,
      productId: product.id,
      variantId: activeVariant?.id ?? null,
      name: product.name,
      slug: product.slug,
      image: product.images[0] ?? null,
      price: currentPrice,
      quantity,
      variant: activeVariant
        ? { id: activeVariant.id, name: activeVariant.name, attributes: activeVariant.attributes }
        : null,
      maxStock: activeVariant?.stock ?? 99,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/products" className="flex items-center gap-1 hover:text-neutral-900">
          <ArrowLeft className="h-4 w-4" />
          Products
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-neutral-900">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-neutral-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
            {product.images.length > 0 ? (
              <Image
                src={product.images[selectedImage].url}
                alt={product.images[selectedImage].altText ?? product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-400">
                <Eye className="h-16 w-16" />
              </div>
            )}
            {discountPercent > 0 && (
              <Badge className="absolute left-4 top-4 bg-rose-500 text-white">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    i === selectedImage ? "border-neutral-900" : "border-transparent"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? `${product.name} ${i + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="mb-2 inline-block text-xs font-medium uppercase tracking-wider text-neutral-500 hover:text-neutral-900"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="text-3xl font-bold text-neutral-900">{product.name}</h1>

          {/* Rating */}
          {product.reviewSummary.totalReviews > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.reviewSummary.averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-neutral-200 text-neutral-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-neutral-500">
                {product.reviewSummary.averageRating} ({product.reviewSummary.totalReviews} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-neutral-900">
              {formatPrice(currentPrice)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > currentPrice && (
              <span className="text-lg text-neutral-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <Separator className="my-6" />

          {/* Description */}
          <p className="text-neutral-600 leading-relaxed">{product.description}</p>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-neutral-900">Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id === selectedVariant ? null : variant.id)}
                    disabled={variant.stock === 0}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      variant.id === selectedVariant
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : variant.stock === 0
                          ? "border-neutral-200 bg-neutral-50 text-neutral-300 cursor-not-allowed"
                          : "border-neutral-300 text-neutral-700 hover:border-neutral-900"
                    }`}
                  >
                    {variant.name}
                    {variant.price !== product.basePrice && (
                      <span className="ml-1 text-xs">({formatPrice(variant.price)})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-lg border">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-r-none"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="flex h-10 w-12 items-center justify-center text-sm font-medium">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-l-none"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button size="lg" className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="mt-6 text-xs text-neutral-400">SKU: {product.sku}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-4 w-48" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
