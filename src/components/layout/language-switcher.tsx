"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation, type Locale } from "@/lib/i18n";

const languages: { code: Locale; flag: string; label: string }[] = [
  { code: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
  { code: "en", flag: "🇺🇸", label: "English" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const current = languages.find((l) => l.code === locale) ?? languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change language">
          <span className="text-base">{current.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={locale === lang.code ? "bg-neutral-100" : ""}
          >
            <span className="mr-2 text-base">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
