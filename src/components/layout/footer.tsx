// =============================================================================
// Footer - Site-wide footer
// =============================================================================

import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

const FOOTER_LINKS = {
  Shop: [
    { href: "/products", label: "All Products" },
    { href: "/products?featured=true", label: "Featured" },
    { href: "/categories", label: "Categories" },
  ],
  Account: [
    { href: "/account/profile", label: "My Profile" },
    { href: "/account/orders", label: "Order History" },
    { href: "/account/addresses", label: "Addresses" },
  ],
  Support: [
    { href: "#", label: "Contact Us" },
    { href: "#", label: "Shipping Info" },
    { href: "#", label: "Returns & Exchanges" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-neutral-900"
            >
              {SITE_CONFIG.name}
            </Link>
            <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
              {SITE_CONFIG.description}
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-neutral-900">
                {title}
              </h3>
              <ul className="mt-3 space-y-2.5">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t pt-6">
          <p className="text-center text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
