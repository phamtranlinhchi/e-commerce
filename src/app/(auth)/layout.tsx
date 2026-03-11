// =============================================================================
// Auth Layout - minimal centered layout for login/register pages
// =============================================================================

import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-2xl font-bold tracking-tight text-neutral-900"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 text-white text-sm font-bold">
          S
        </div>
        {SITE_CONFIG.name}
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
