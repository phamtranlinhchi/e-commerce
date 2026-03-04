# ShopNex E-Commerce Platform — Architecture

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + Shadcn UI |
| Icons | Lucide React |
| Client State | Zustand (cart, UI) |
| Server State | TanStack React Query |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Auth | NextAuth.js |

## Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (storefront)/             # Public pages (layout: Header + Footer)
│   │   ├── page.tsx              # Landing page
│   │   ├── products/             # Product catalog + [slug] detail
│   │   ├── categories/[slug]/    # Category listing
│   │   ├── cart/                 # Full cart page
│   │   └── checkout/             # Checkout flow
│   ├── (auth)/                   # Auth pages (minimal layout)
│   │   ├── login/
│   │   └── register/
│   ├── (customer)/               # Authenticated customer pages
│   │   └── account/
│   │       ├── profile/
│   │       ├── orders/[id]/
│   │       └── addresses/
│   ├── admin/(dashboard)/        # Admin dashboard (RBAC protected)
│   │   ├── analytics/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── categories/
│   │   └── users/
│   └── api/                      # Route Handlers
│       ├── auth/[...nextauth]/
│       ├── products/
│       ├── categories/
│       ├── orders/
│       └── cart/
├── components/
│   ├── ui/                       # Shadcn UI primitives
│   ├── layout/                   # Header, Footer, navigation
│   ├── product/                  # ProductCard, ProductGrid, etc.
│   ├── cart/                     # CartDrawer, CartItem
│   ├── checkout/                 # Checkout form components
│   ├── admin/                    # Admin-specific components
│   └── shared/                   # Reusable cross-cutting components
├── hooks/                        # Custom React hooks
├── stores/                       # Zustand stores (cart, ui)
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── format.ts                 # Formatting utilities
│   ├── utils.ts                  # Shadcn cn() utility
│   ├── constants/                # App-wide constants
│   ├── validators/               # Zod schemas
│   └── services/                 # Business logic (decoupled from routes)
├── types/                        # Shared TypeScript interfaces
├── providers/                    # React context providers
├── config/                       # App configuration
└── generated/prisma/             # Generated Prisma client
```

## Architecture Principles

1. **Route Groups** — `(storefront)`, `(auth)`, `(customer)` enable distinct layouts per section without affecting URL paths.
2. **Separation of Concerns** — `lib/services/` for business logic, `hooks/` for data fetching, components for presentation.
3. **Type Safety** — All entities have explicit types in `types/`. No `any`.
4. **State Split** — Zustand for client state (cart, UI), React Query for server state (products, orders).
5. **Prisma Singleton** — Single client instance via `lib/prisma.ts` to avoid connection exhaustion.

## Database Schema (ERD Summary)

```
User ──< Account, Session, Address, Order, Review, CartItem
Category ──< Product (self-referencing parent/children)
Product ──< ProductImage, ProductVariant, Review, OrderItem, CartItem
Order ──< OrderItem
```

Key design decisions:
- **OrderItem denormalization**: Product name/SKU are snapshotted at order time for historical accuracy.
- **Variant attributes as JSON**: Flexible key-value pairs allow arbitrary variant dimensions (color, size, material).
- **Server-side cart**: CartItem model enables persistent carts across devices for authenticated users.

## Phase Roadmap

- **Phase 1** ✅ Architecture, schema, foundational components
- **Phase 2**: API routes, product catalog with filtering/pagination, auth
- **Phase 3**: Cart sync, checkout flow, payment integration
- **Phase 4**: Customer portal, order management
- **Phase 5**: Admin dashboard, analytics, RBAC
