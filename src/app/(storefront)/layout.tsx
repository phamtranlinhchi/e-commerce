// =============================================================================
// Storefront Layout - wraps all public-facing pages with Header + Footer
// =============================================================================

import { Header, Footer, MobileMenu } from "@/components/layout";

interface StorefrontLayoutProps {
  children: React.ReactNode;
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <MobileMenu />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
