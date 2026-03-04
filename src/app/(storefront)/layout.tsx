// =============================================================================
// Storefront Layout - wraps all public-facing pages with Header + Footer
// =============================================================================

import { Header } from "@/components/layout";
import { Footer } from "@/components/layout";

interface StorefrontLayoutProps {
  children: React.ReactNode;
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
