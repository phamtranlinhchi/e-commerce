"use client";

// =============================================================================
// Root Providers - composes all client-side providers
// =============================================================================

import { useEffect } from "react";
import { QueryProvider } from "./query-provider";
import { Toaster } from "@/components/ui/sonner";
import { CartDrawer } from "@/components/cart";
import { useCartStore } from "@/stores/cart-store";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Trigger Zustand persist rehydration once at the app level
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return (
    <QueryProvider>
      {children}
      <CartDrawer />
      <Toaster position="bottom-right" richColors />
    </QueryProvider>
  );
}
