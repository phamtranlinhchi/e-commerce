// =============================================================================
// Application-wide constants
// =============================================================================

export const SITE_CONFIG = {
  name: "ShopNex",
  description: "Premium e-commerce experience with curated products.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 48,
} as const;

export const CURRENCY = {
  code: "USD",
  symbol: "$",
  locale: "en-US",
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
} as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
} as const;
