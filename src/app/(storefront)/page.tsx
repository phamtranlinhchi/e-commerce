// =============================================================================
// Landing Page - Homepage with hero section and featured products
// =============================================================================

import Link from "next/link";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";

const VALUE_PROPS = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $75",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% protected checkout",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "30-day return policy",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated customer care",
  },
] as const;

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-800" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest backdrop-blur-sm">
            New Collection 2026
          </span>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Discover Premium Products
            <br />
            <span className="bg-gradient-to-r from-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Curated Just for You
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-neutral-400 sm:text-lg">
            Explore our handpicked selection of high-quality products. From
            everyday essentials to luxury items, find everything you need in one
            place.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-white text-neutral-900 hover:bg-neutral-100 px-8"
              asChild
            >
              <Link href="/products">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8"
              asChild
            >
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          {VALUE_PROPS.map((prop) => (
            <div key={prop.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                <prop.icon className="h-5 w-5 text-neutral-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  {prop.title}
                </h3>
                <p className="text-xs text-neutral-500">{prop.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Placeholder */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                Featured Products
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Hand-picked favorites from our latest collection.
              </p>
            </div>
            <Link
              href="/products?featured=true"
              className="hidden items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-900 sm:flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Placeholder grid - will be replaced with ProductGrid + data in Phase 2 */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl bg-neutral-100"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-neutral-100">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            Join {SITE_CONFIG.name} Today
          </h2>
          <p className="mt-3 max-w-lg text-sm text-neutral-500">
            Create an account to track orders, save your favorites, and get
            exclusive deals delivered to your inbox.
          </p>
          <Button className="mt-6" size="lg" asChild>
            <Link href="/register">Create Free Account</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
