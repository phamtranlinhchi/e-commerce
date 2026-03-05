"use client";

// =============================================================================
// Cart Store - Zustand state management for shopping cart
// =============================================================================
// Handles client-side cart state with persistence via localStorage.
// For authenticated users, cart syncs with the server (Phase 2).
// =============================================================================

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import type { CartItem, CartSummary } from "@/types";

// No-op storage for SSR environments where localStorage is unavailable
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// Tax rate placeholder - will be dynamic in production
const ESTIMATED_TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 75;
const FLAT_SHIPPING_RATE = 9.99;

interface CartStore {
  // State
  items: CartItem[];
  isOpen: boolean;

  // Cart drawer actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Cart item actions
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number
  ) => void;
  clearCart: () => void;

  // Computed values
  getSummary: () => CartSummary;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // -----------------------------------------------------------------------
      // Initial State
      // -----------------------------------------------------------------------
      items: [],
      isOpen: false,

      // -----------------------------------------------------------------------
      // Cart Drawer
      // -----------------------------------------------------------------------
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      // -----------------------------------------------------------------------
      // Cart Item Management
      // -----------------------------------------------------------------------
      addItem: (newItem) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              item.variantId === newItem.variantId
          );

          if (existingIndex > -1) {
            // Update quantity of existing item, capped at max stock
            const updatedItems = [...state.items];
            const existing = updatedItems[existingIndex];
            const newQuantity = Math.min(
              existing.quantity + newItem.quantity,
              newItem.maxStock
            );
            updatedItems[existingIndex] = { ...existing, quantity: newQuantity };
            return { items: updatedItems, isOpen: true };
          }

          // Add new item to cart
          return { items: [...state.items, newItem], isOpen: true };
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.productId === productId && item.variantId === variantId
              )
          ),
        })),

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) =>
                  !(
                    item.productId === productId &&
                    item.variantId === variantId
                  )
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              item.productId === productId && item.variantId === variantId
                ? { ...item, quantity: Math.min(quantity, item.maxStock) }
                : item
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      // -----------------------------------------------------------------------
      // Computed Values
      // -----------------------------------------------------------------------
      getSummary: (): CartSummary => {
        const { items } = get();
        const subtotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const estimatedShipping =
          subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
        const estimatedTax = subtotal * ESTIMATED_TAX_RATE;
        const total = subtotal + estimatedShipping + estimatedTax;

        return {
          subtotal: Math.round(subtotal * 100) / 100,
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
          estimatedTax: Math.round(estimatedTax * 100) / 100,
          estimatedShipping: Math.round(estimatedShipping * 100) / 100,
          total: Math.round(total * 100) / 100,
        };
      },

      getItemCount: (): number => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "ecommerce-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage
      ),
      skipHydration: true,
      // Only persist items, not UI state like isOpen
      partialize: (state) => ({ items: state.items }),
    }
  )
);
