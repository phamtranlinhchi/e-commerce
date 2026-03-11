"use client";

// =============================================================================
// Cart Page - Full cart view with quantity controls and summary
// =============================================================================

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores";
import { useMounted } from "@/hooks";
import { formatPrice } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD = 75;

function computeSummary(items: { price: number; quantity: number }[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const estimatedShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 9.99;
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + estimatedShipping + estimatedTax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    estimatedTax: Math.round(estimatedTax * 100) / 100,
    estimatedShipping: Math.round(estimatedShipping * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export default function CartPage() {
  const mounted = useMounted();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);

  if (!mounted) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <div className="mt-8 animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  const summary = computeSummary(items);

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-24 text-center">
        <ShoppingBag className="h-20 w-20 text-neutral-300" />
        <h1 className="mt-6 text-2xl font-bold text-neutral-900">
          Your cart is empty
        </h1>
        <p className="mt-2 text-neutral-500">
          Looks like you haven't added anything yet.
        </p>
        <Button className="mt-8" size="lg" asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shopping Cart ({summary.itemCount})</h1>
        <Button
          variant="ghost"
          size="sm"
          className="text-neutral-500 hover:text-red-500"
          onClick={clearCart}
        >
          Clear Cart
        </Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-4">
                {/* Image */}
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {item.image ? (
                    <Image
                      src={item.image.url}
                      alt={item.image.altText ?? item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-400">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-medium text-neutral-900 hover:underline"
                      >
                        {item.name}
                      </Link>
                      {item.variant && (
                        <p className="mt-0.5 text-sm text-neutral-500">
                          {item.variant.name}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-neutral-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.variantId,
                            item.quantity - 1
                          )
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-10 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={item.quantity >= item.maxStock}
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.variantId,
                            item.quantity + 1
                          )
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="ml-2 text-sm text-neutral-400">
                        {formatPrice(item.price)} each
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-neutral-400 hover:text-red-500"
                      onClick={() => removeItem(item.productId, item.variantId)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <Button variant="ghost" size="sm" asChild>
            <Link href="/products" className="text-neutral-600">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 p-6">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <Separator className="my-4" />
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal ({summary.itemCount} items)</span>
                <span>{formatPrice(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Shipping</span>
                <span>
                  {summary.estimatedShipping === 0
                    ? "Free"
                    : formatPrice(summary.estimatedShipping)}
                </span>
              </div>
              {summary.estimatedShipping > 0 && (
                <p className="text-xs text-neutral-400">
                  Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
                </p>
              )}
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Estimated Tax</span>
                <span>{formatPrice(summary.estimatedTax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-neutral-900">
                <span>Total</span>
                <span>{formatPrice(summary.total)}</span>
              </div>
            </div>
            <Button className="mt-6 w-full" size="lg" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
