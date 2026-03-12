"use client";

// =============================================================================
// MobileMenu - Slide-out navigation for mobile devices using Shadcn Sheet
// =============================================================================

import Link from "next/link";
import { X, ShoppingBag, Grid3X3, Star, User, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/stores";
import { useAuth } from "@/hooks";
import { SITE_CONFIG } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/products", label: "Shop", icon: ShoppingBag },
  { href: "/categories", label: "Categories", icon: Grid3X3 },
  { href: "/products?featured=true", label: "Featured", icon: Star },
] as const;

export function MobileMenu() {
  const isMobileMenuOpen = useUIStore((state) => state.isMobileMenuOpen);
  const closeMobileMenu = useUIStore((state) => state.closeMobileMenu);
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={(open) => !open && closeMobileMenu()}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-left">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white text-sm font-bold">
              S
            </div>
            {SITE_CONFIG.name}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col p-4">
          {/* Navigation Links */}
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}

          <Separator className="my-3" />

          {/* Auth Section */}
          {isAuthenticated && user ? (
            <>
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                <p className="text-xs text-neutral-500">{user.email}</p>
              </div>
              <Link
                href="/account"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                <User className="h-5 w-5" />
                My Account
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  <Grid3X3 className="h-5 w-5" />
                  Admin Dashboard
                </Link>
              )}
              <Separator className="my-3" />
              <Button
                variant="ghost"
                className="justify-start gap-3 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  signOut();
                  closeMobileMenu();
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                <LogIn className="h-5 w-5" />
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                <UserPlus className="h-5 w-5" />
                Sign up
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
