// =============================================================================
// Cart-related type definitions
// =============================================================================

import type { ProductImage, ProductVariant } from "./product";

/** Single item in the shopping cart */
export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  image: ProductImage | null;
  price: number;
  quantity: number;
  variant: Pick<ProductVariant, "id" | "name" | "attributes"> | null;
  maxStock: number;
}

/** Complete cart state */
export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

/** Summary of cart totals */
export interface CartSummary {
  subtotal: number;
  itemCount: number;
  estimatedTax: number;
  estimatedShipping: number;
  total: number;
}
