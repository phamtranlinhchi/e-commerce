"use client";

// =============================================================================
// useMounted - Hook to detect client-side hydration completion
// =============================================================================
// Prevents hydration mismatches when using Zustand persist middleware
// or any other client-only state (localStorage, sessionStorage, etc).
// =============================================================================

import { useState, useEffect } from "react";

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
