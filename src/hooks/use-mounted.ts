"use client";

// =============================================================================
// useMounted - Hook to detect client-side hydration completion
// =============================================================================
// Prevents hydration mismatches when using Zustand persist middleware
// or any other client-only state (localStorage, sessionStorage, etc).
// Also triggers manual Zustand rehydration when skipHydration is used.
// =============================================================================

import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Manually trigger Zustand persist rehydration on client
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  return mounted;
}
