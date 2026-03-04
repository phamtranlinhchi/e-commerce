// =============================================================================
// Formatting utilities
// =============================================================================

import { CURRENCY } from "./constants";

/** Format a number as currency string (e.g., "$19.99") */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
  }).format(price);
}

/** Format a date string to a human-readable format */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat(CURRENCY.locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

/** Format a date string to a shorter format */
export function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat(CURRENCY.locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

/** Calculate discount percentage between two prices */
export function getDiscountPercentage(
  originalPrice: number,
  currentPrice: number
): number {
  if (originalPrice <= 0 || currentPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/** Truncate text with ellipsis */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}
