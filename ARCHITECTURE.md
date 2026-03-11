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
| Database | PostgreSQL 16 |
| ORM | Prisma 7 |
| Auth | NextAuth.js v4 (JWT + Credentials) |
| Deployment | Docker + Docker Compose |

## Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (storefront)/             # Public pages (layout: Header + Footer)
│   │   ├── page.tsx              # Landing page
│   │   ├── products/             # Product catalog + [slug] detail
│   │   ├── categories/           # Category listing + [slug] detail
│   │   ├── cart/                 # Full cart page (qty controls, summary)
│   │   └── checkout/             # Checkout flow
│   │       ├── page.tsx          # Shipping form + order summary
│   │       └── success/          # Order confirmation page
│   ├── (auth)/                   # Auth pages (minimal layout)
│   │   ├── layout.tsx            # Centered minimal layout
│   │   ├── login/                # Email/password login
│   │   └── register/             # Registration with validation
│   ├── (customer)/               # Authenticated customer pages
│   │   └── account/
│   │       ├── layout.tsx        # Sidebar navigation layout
│   │       ├── page.tsx          # Account dashboard
│   │       ├── profile/          # Edit name, phone
│   │       └── orders/           # Order history + [id] detail
│   ├── admin/(dashboard)/        # Admin dashboard (RBAC protected)
│   │   ├── analytics/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── categories/
│   │   └── users/
│   └── api/                      # Route Handlers
│       ├── auth/
│       │   ├── [...nextauth]/    # NextAuth (Credentials + Prisma adapter)
│       │   ├── register/         # POST registration
│       │   └── profile/          # PATCH profile update
│       ├── products/             # GET list (filter/paginate), GET [slug]
│       │   └── featured/         # GET featured products
│       ├── categories/           # GET list, GET [slug]
│       ├── orders/               # POST create, GET list, GET [id]
│       └── cart/                 # GET/POST/DELETE + [itemId] PATCH/DELETE
├── components/
│   ├── ui/                       # Shadcn UI primitives (button, card, input, etc.)
│   ├── layout/                   # Header (auth-aware), Footer
│   ├── product/                  # ProductCard, ProductGrid, FeaturedProducts
│   ├── cart/                     # CartDrawer
│   ├── admin/                    # Admin-specific components (Phase 5)
│   └── shared/                   # Reusable cross-cutting components
├── hooks/
│   ├── use-auth.ts               # useAuth() — session, signIn, signOut
│   ├── use-cart-sync.ts          # Zustand ↔ server cart sync on login
│   ├── use-categories.ts         # Category data fetching
│   ├── use-products.ts           # Product data fetching
│   └── use-mounted.ts            # SSR hydration helper
├── stores/
│   ├── cart-store.ts             # Zustand cart (client-side, persisted)
│   └── ui-store.ts               # Zustand UI state (cart drawer, etc.)
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── format.ts                 # Currency/date formatting
│   ├── utils.ts                  # Shadcn cn() utility
│   ├── constants/                # App-wide constants
│   ├── validators/               # Zod schemas (auth, product)
│   └── services/                 # Business logic (decoupled from routes)
│       ├── auth.ts               # getUserByEmail, createUser (bcrypt)
│       ├── product.ts            # getProducts, getProductBySlug, getFeatured
│       ├── category.ts           # getCategories, getCategoryBySlug
│       └── order.ts              # createOrder, getOrderById, getUserOrders
├── middleware.ts                  # Auth middleware (protect /account/*, /admin/*)
├── types/                        # Shared TypeScript interfaces
│   ├── next-auth.d.ts            # NextAuth session type extensions
│   ├── product.ts, cart.ts, order.ts, user.ts, category.ts
│   └── index.ts                  # Barrel exports
├── providers/
│   ├── index.tsx                 # Root providers (Session + Query + CartSync)
│   └── query-provider.tsx        # TanStack React Query provider
└── generated/prisma/             # Generated Prisma client
```

## Architecture Principles

1. **Route Groups** — `(storefront)`, `(auth)`, `(customer)` enable distinct layouts per section without affecting URL paths.
2. **Separation of Concerns** — `lib/services/` for business logic, `hooks/` for data fetching, components for presentation.
3. **Type Safety** — All entities have explicit types in `types/`. No `any`.
4. **State Split** — Zustand for client state (cart, UI), React Query for server state (products, orders).
5. **Prisma Singleton** — Single client instance via `lib/prisma.ts` to avoid connection exhaustion.
6. **Auth Middleware** — `withAuth` middleware protects customer routes (require login) and admin routes (require ADMIN role).
7. **Cart Sync** — Zustand cart merges with server-side CartItem on login; server becomes source of truth for authenticated users.

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
- **Order totals**: Subtotal, shipping (free above $75), tax (8%), and discount calculated at order creation.
- **Order number format**: `SN-YYYYMMDD-XXXX` (human-readable, unique).

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| PATCH | `/api/auth/profile` | ✅ | Update profile (name, phone) |
| GET | `/api/products` | — | List products (filter, paginate, sort) |
| GET | `/api/products/featured` | — | Featured products |
| GET | `/api/products/[slug]` | — | Product detail |
| GET | `/api/categories` | — | List categories |
| GET | `/api/categories/[slug]` | — | Category with products |
| GET | `/api/cart` | ✅ | Get user's cart |
| POST | `/api/cart` | ✅ | Add item (upsert quantity) |
| DELETE | `/api/cart` | ✅ | Clear cart |
| PATCH | `/api/cart/[itemId]` | ✅ | Update item quantity |
| DELETE | `/api/cart/[itemId]` | ✅ | Remove item |
| POST | `/api/orders` | ✅ | Create order from cart |
| GET | `/api/orders` | ✅ | List user's orders |
| GET | `/api/orders/[id]` | ✅ | Order detail |

## Phase Roadmap

- **Phase 1** ✅ Architecture, schema, foundational components
- **Phase 2** ✅ API routes, product catalog with filtering/pagination, auth (NextAuth + Credentials)
- **Phase 3** ✅ Cart API, cart sync, checkout flow, order creation
- **Phase 4** ✅ Customer portal (account dashboard, order history, profile)
- **Phase 5** ⏳ Admin dashboard, analytics, RBAC
