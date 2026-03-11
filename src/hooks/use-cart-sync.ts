"use client";

// =============================================================================
// Cart Sync Hook - Syncs Zustand cart with server for authenticated users
// =============================================================================
// When a user logs in, merges their local cart with server cart.
// When logged out, cart stays in localStorage only.
// =============================================================================

import { useEffect, useRef } from "react";
import { useAuth } from "./use-auth";
import { useCartStore } from "@/stores/cart-store";

export function useCartSync() {
  const { isAuthenticated, isLoading } = useAuth();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (isLoading || syncedRef.current) return;
    if (!isAuthenticated) {
      syncedRef.current = false;
      return;
    }

    syncedRef.current = true;

    async function syncCart() {
      try {
        const localItems = useCartStore.getState().items;

        // Push local items to server (server handles upsert/merge)
        if (localItems.length > 0) {
          await Promise.all(
            localItems.map((item) =>
              fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  productId: item.productId,
                  variantId: item.variantId,
                  quantity: item.quantity,
                }),
              }),
            ),
          );
        }

        // Fetch merged server cart — server is now source of truth
        const res = await fetch("/api/cart");
        if (!res.ok) return;

        const serverItems = await res.json();

        // Map server items to our CartItem shape
        const mapped = serverItems.map((item: Record<string, unknown>) => {
          const product = item.product as Record<string, unknown>;
          const variant = item.variant as Record<string, unknown> | null;
          const images = product.images as Array<Record<string, unknown>>;
          return {
            id: item.id,
            productId: product.id,
            variantId: variant?.id ?? null,
            name: product.name,
            slug: product.slug,
            image: images?.[0] ?? null,
            price: variant?.price ?? product.basePrice,
            quantity: item.quantity,
            variant: variant
              ? { id: variant.id, name: variant.name, attributes: variant.attributes }
              : null,
            maxStock: variant?.stock ?? 99,
          };
        });

        // Replace local cart with server state
        useCartStore.setState({ items: mapped });
      } catch (error) {
        console.error("[CART_SYNC]", error);
      }
    }

    syncCart();
  }, [isAuthenticated, isLoading]);
}
