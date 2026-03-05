"use client";

// =============================================================================
// Header - Main navigation bar for the storefront
// =============================================================================

import Link from "next/link";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore, useUIStore } from "@/stores";
import { useMounted } from "@/hooks";
import { SITE_CONFIG } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/products?featured=true", label: "Featured" },
] as const;

export function Header() {
  const mounted = useMounted();
  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const toggleMobileMenu = useUIStore((state) => state.toggleMobileMenu);

  // Compute count from items directly (avoid calling store methods in selectors)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Use 0 during SSR to prevent hydration mismatch from Zustand persist
  const displayCount = mounted ? itemCount : 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-neutral-900"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white text-sm font-bold">
              S
            </div>
            {SITE_CONFIG.name}
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Search products">
            <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/account" aria-label="My account">
              <User className="h-5 w-5" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={openCart}
            aria-label={`Shopping cart with ${displayCount} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            {displayCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 p-0 text-[10px] font-bold text-white hover:bg-neutral-900">
                {displayCount > 99 ? "99+" : displayCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
