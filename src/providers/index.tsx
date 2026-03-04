"use client";

// =============================================================================
// Root Providers - composes all client-side providers
// =============================================================================

import { QueryProvider } from "./query-provider";
import { Toaster } from "@/components/ui/sonner";
import { CartDrawer } from "@/components/cart";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      {children}
      <CartDrawer />
      <Toaster position="bottom-right" richColors />
    </QueryProvider>
  );
}
