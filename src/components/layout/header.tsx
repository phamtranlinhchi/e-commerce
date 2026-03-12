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
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore, useUIStore } from "@/stores";
import { useMounted, useAuth } from "@/hooks";
import { SITE_CONFIG } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const mounted = useMounted();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const toggleMobileMenu = useUIStore((state) => state.toggleMobileMenu);
  const { t } = useTranslation();

  const NAV_LINKS = [
    { href: "/products", label: t("common.shop") },
    { href: "/categories", label: t("common.categories") },
    { href: "/products?featured=true", label: t("common.featured") },
  ] as const;

  // Compute count from items directly (avoid calling store methods in selectors)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Use 0 during SSR to prevent hydration mismatch from Zustand persist
  const displayCount = mounted ? itemCount : 0;

  // Get user initials for avatar fallback
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

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
          <Button variant="ghost" size="icon" aria-label={t("common.search")}>
            <Search className="h-5 w-5" />
          </Button>

          <LanguageSwitcher />

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label={t("common.wishlist")}
          >
            <Heart className="h-5 w-5" />
          </Button>

          {/* Auth: User menu or login/register links */}
          {!isLoading && mounted && isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label="User menu"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-neutral-500">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <User className="mr-2 h-4 w-4" />
                    {t("common.myAccount")}
                  </Link>
                </DropdownMenuItem>
                {user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">{t("admin.dashboard")}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !isLoading && mounted ? (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t("common.signIn")}</Link>
              </Button>
              <Button size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/register">{t("common.signUp")}</Link>
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" aria-label="Loading">
              <User className="h-5 w-5" />
            </Button>
          )}

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
