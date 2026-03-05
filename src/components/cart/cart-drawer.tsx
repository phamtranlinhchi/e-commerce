"use client";

// =============================================================================
// CartDrawer - Slide-out cart panel using Shadcn Sheet
// =============================================================================

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores";
import { useMounted } from "@/hooks";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const mounted = useMounted();
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart } =
    useCartStore();
  const summary = useCartStore((state) => state.getSummary());

  // Don't render until client-side hydration is complete
  if (!mounted) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="space-y-0 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <ShoppingBag className="h-5 w-5" />
              Cart ({summary.itemCount})
            </SheetTitle>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-xs text-neutral-500 hover:text-red-500"
              >
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        <Separator />

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-16 w-16 text-neutral-300" />
            <div>
              <p className="text-lg font-medium text-neutral-600">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                Add some products to get started.
              </p>
            </div>
            <Button variant="outline" onClick={closeCart} asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {/* Item image */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {item.image ? (
                        <Image
                          src={item.image.url}
                          alt={item.image.altText ?? item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-neutral-400">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Item details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="text-sm font-medium text-neutral-900 hover:underline line-clamp-1"
                          onClick={closeCart}
                        >
                          {item.name}
                        </Link>
                        {item.variant && (
                          <p className="text-xs text-neutral-500">
                            {item.variant.name}
                          </p>
                        )}
                        <p className="mt-0.5 text-sm font-semibold text-neutral-900">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
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
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
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
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-neutral-400 hover:text-red-500"
                          onClick={() =>
                            removeItem(item.productId, item.variantId)
                          }
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Cart Summary */}
            <div className="space-y-3 pt-4">
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span>
                <span>{formatPrice(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Estimated Shipping</span>
                <span>
                  {summary.estimatedShipping === 0
                    ? "Free"
                    : formatPrice(summary.estimatedShipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Estimated Tax</span>
                <span>{formatPrice(summary.estimatedTax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold text-neutral-900">
                <span>Total</span>
                <span>{formatPrice(summary.total)}</span>
              </div>

              <Button className="w-full" size="lg" asChild>
                <Link href="/checkout" onClick={closeCart}>
                  Proceed to Checkout
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={closeCart}
                asChild
              >
                <Link href="/cart">View Full Cart</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
