"use client";

// =============================================================================
// i18n — Simple translation system with React Context
// Default: Vietnamese (vi)
// =============================================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { vi } from "./locales/vi";
import { en } from "./locales/en";

export type Locale = "vi" | "en";

const locales: Record<Locale, Record<string, unknown>> = {
  vi: vi as unknown as Record<string, unknown>,
  en: en as unknown as Record<string, unknown>,
};

const STORAGE_KEY = "shopnex-locale";

// ---------------------------------------------------------------------------
// Helper: resolve nested key like "common.search"
// ---------------------------------------------------------------------------
function resolve(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return path; // fallback to key
    }
  }
  return typeof current === "string" ? current : path;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "vi",
  setLocale: () => {},
  t: (key) => key,
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && locales[stored]) {
      setLocaleState(stored);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const translations = locales[locale] ?? vi;
      return resolve(translations as unknown as Record<string, unknown>, key);
    },
    [locale],
  );

  // During SSR / hydration, always render Vietnamese to avoid mismatch
  const value: LanguageContextValue = {
    locale: mounted ? locale : "vi",
    setLocale,
    t: mounted
      ? t
      : (key: string) =>
          resolve(vi as unknown as Record<string, unknown>, key),
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useTranslation() {
  return useContext(LanguageContext);
}

// ---------------------------------------------------------------------------
// Currency formatting
// ---------------------------------------------------------------------------
export function formatPrice(amount: number, locale: Locale = "vi"): string {
  if (locale === "vi") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount * 25000); // approximate USD → VND
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export type { Translations } from "./locales/vi";
