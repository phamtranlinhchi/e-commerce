"use client";

// =============================================================================
// Account Layout - Sidebar navigation for customer account pages
// =============================================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Settings, LayoutDashboard } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package, exact: false },
  { href: "/account/profile", label: "Profile", icon: Settings, exact: true },
];

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center gap-2 mb-8">
            <User className="h-6 w-6" />
            <h1 className="text-2xl font-bold">My Account</h1>
          </div>

          <div className="grid gap-8 md:grid-cols-[220px_1fr]">
            {/* Sidebar */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-neutral-100 text-neutral-900"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Content */}
            <div>{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
