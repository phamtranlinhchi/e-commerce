"use client";

// =============================================================================
// Root Providers - composes all client-side providers
// =============================================================================

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "./query-provider";
import { Toaster } from "@/components/ui/sonner";
import { CartDrawer } from "@/components/cart";
import { useCartStore } from "@/stores/cart-store";
import { useCartSync } from "@/hooks/use-cart-sync";
import { LanguageProvider } from "@/lib/i18n";

interface ProvidersProps {
  children: React.ReactNode;
}

function CartSyncProvider({ children }: { children: React.ReactNode }) {
  // Trigger Zustand persist rehydration once at the app level
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  // Sync cart with server for authenticated users
  useCartSync();

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <QueryProvider>
        <LanguageProvider>
          <CartSyncProvider>
            {children}
            <CartDrawer />
            <Toaster position="bottom-right" richColors />
          </CartSyncProvider>
        </LanguageProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
