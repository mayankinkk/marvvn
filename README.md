# MARVVN

Unisex luxury streetwear e-commerce platform for men, women and accessories — oversized t-shirts, joggers, hoodies, cargos, caps, jackets and more. Production storefront is built with Next.js 14 App Router and Supabase, deployed on Vercel.

- **Live storefront:** https://marvvn.online
- **Framework:** Next.js 14.2 (`src/app/layout.tsx:25`)
- **Package:** `marvvn@1.0.0` (`package.json:2`)

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Features](#features)
5. [Project Structure](#project-structure)
6. [Data Models](#data-models)
7. [Database Schema & Migrations](#database-schema--migrations)
8. [API Reference](#api-reference)
9. [State Management](#state-management)
10. [Styling & Design System](#styling--design-system)
11. [Authentication & Authorization](#authentication--authorization)
12. [Security](#security)
13. [SEO, Performance & PWA](#seo-performance--pwa)
14. [Internationalization](#internationalization)
15. [Prerequisites](#prerequisites)
16. [Installation & Local Development](#installation--local-development)
17. [Environment Variables](#environment-variables)
18. [Database Setup](#database-setup)
19. [Scripts](#scripts)
20. [Testing](#testing)
21. [Deployment](#deployment)
22. [Middleware & Maintenance Mode](#middleware--maintenance-mode)
23. [Troubleshooting](#troubleshooting)
24. [License](#license)

---

## Overview

MARVVN is a full-stack e-commerce application that covers the entire retail lifecycle:

- Public storefront with product discovery, search, cart, wishlist and checkout
- Authenticated customer account area (orders, addresses, profile)
- Protected admin panel for catalog, orders, customers, content and operations
- Server-side integrations for payments (Razorpay), email (Resend), AI chat (Google Generative AI), Instagram Commerce sync and WhatsApp catalog

The codebase favors server components and API routes for data access, with client-side Zustand stores for cart/wishlist persistence and optimistic UI. Supabase provides Postgres, Auth, Storage and Row Level Security. All admin writes go through a service-role client (`src/lib/supabase/admin.ts:3`), while public reads use the anon key with RLS.

---

## Tech Stack

| Category | Technology | Version / Config |
|---|---|---|
| Framework | Next.js (App Router) | `14.2.0` (`package.json:23`) |
| Language | TypeScript | `^5.4.0` (`package.json:47`) |
| UI / Styling | Tailwind CSS, PostCSS, Autoprefixer | `^3.4.3` / `^8.4.38` / `^10.4.19` |
| Class merging | `clsx` + `tailwind-merge` | `^2.1.0` / `^2.2.0` |
| State | Zustand | `^4.5.0` with `persist` middleware (`src/lib/store.ts:91`) |
| Backend | Supabase (Postgres, Auth, Storage) | `@supabase/ssr ^0.12.5`, `@supabase/supabase-js ^2.112.4` |
| Payments | Razorpay (checkout.js + server verify/webhook) | `src/app/api/payment/route.ts:1`, `verify/route.ts`, `webhook/route.ts` |
| AI | Google Generative AI | `^0.24.1` (`src/app/api/chat/route.ts:1`) |
| Email | Resend | `^6.24.0` (`src/lib/email.ts:1`) |
| Animations | Framer Motion | `^13.1.1` |
| Icons | lucide-react | `^0.378.0` |
| Images | lazysizes + blur-up plugin | `^5.3.2` (`src/app/layout.tsx:81`) |
| i18n | next-intl | `^4.14.0` (`src/lib/i18n/`) |
| Progress | next-nprogress-bar | `^2.4.7` |
| Analytics | Google Analytics, Facebook Pixel, Vercel Speed Insights | `src/components/Analytics.tsx:1`, `src/app/layout.tsx:9` |
| IDs | uuid | `^14.0.2` |
| Lint | ESLint + eslint-config-next | `^8.57.0` |
| Testing | Vitest + Testing Library + jsdom | `^4.1.11` / `^16.3.3` / `^30.0.1` (`vitest.config.mts:7`) |
| Deployment | Vercel (cron, headers) | `vercel.json:1`, `next.config.js:10` |

---

## Architecture

```
Browser (React 18, Zustand, next-intl)
   │
   ├── App Router (src/app/) ── Server Components, Route Handlers
   │       ├── Middleware (src/middleware.ts:1) ── maintenance + auth gate
   │       ├── API routes (src/app/api/) ── REST over Next.js handlers
   │       └── Pages (storefront / account / admin / policies)
   │
   ├── Supabase
   │       ├── Postgres + RLS (supabase/schema.sql:82)
   │       ├── Auth (src/lib/supabase/client.ts:3, server.ts:4, admin.ts:3)
   │       └── Storage (product images, banners, blog assets)
   │
   ├── External services
   │       ├── Razorpay checkout.js (src/app/checkout/page.tsx:60, next.config.js:24)
   │       ├── Resend (src/lib/email.ts:1, src/lib/scheduled-emails.ts:1)
   │       ├── Google Generative AI (src/app/api/chat/route.ts)
   │       ├── Instagram Graph API (src/lib/instagram-commerce.ts:1)
   │       └── WhatsApp catalog (src/lib/whatsapp.ts:1)
   │
   └── Vercel
           ├── Cron: /api/cron/instagram-sync, /api/cron/process-emails (vercel.json:3)
           ├── Headers: Cache-Control + CSP (next.config.js:10)
           └── Speed Insights (src/app/layout.tsx:92)
```

**Request flow for a product page:**

1. `src/app/products/[handle]/page.tsx:1` (client) calls `useProduct(handle)` (`src/lib/hooks/useProducts.ts:23`)
2. Hook fetches `GET /api/products/[handle]` (`src/app/api/products/[handle]/route.ts:1`)
3. Handler reads from Supabase via `createClient()` (`src/lib/supabase/server.ts:4`) and computes stock from `product_variants` (`src/app/api/products/route.ts:25`)
4. Client renders `ImageZoom`, `SizeGuide`, `ProductReviews`, `StickyAddToCart`, JSON-LD

**Checkout flow:**

```
Cart (Zustand persist marvvn-cart, src/lib/store.ts:316)
  → Checkout form (src/app/checkout/page.tsx:18)
  → POST /api/payment (create Razorpay order)
  → Razorpay checkout.js modal (src/app/checkout/page.tsx:90)
  → POST /api/payment/verify (signature check)
  → POST /api/orders (persist order + order_items)
  → POST /api/payment/webhook (async confirmation)
```

---

## Features

### 1. Storefront & UX (`src/app/page.tsx:22`, `src/components/`)

- **Homepage composition:** transparent `Header` over full-viewport `HeroBanner` (`src/app/page.tsx:43`), `ShopByGender` full-bleed, `CollectionSlider` for New Arrivals, `PromoBanner`, `ProductGrid` for Best Sellers / Women / Men, `ReviewsSection`, `TrustBadges`, `FeaturesBar`, `AboutSection`, `BlogSection`, `InstagramFeed`, `RecentlyViewed`, `Footer`
- **Header** (`src/components/Header.tsx:32`): announcement marquee (`settings.announcement_bar`), scroll-aware transparent→opaque switch (`src/components/Header.tsx:70`), desktop mega-menu with glassmorphism (`src/components/Header.tsx:283`), mobile drawer, search trigger, wishlist/cart badges (`useCartStore` / `useWishlistStore`), auth dropdown
- **Navigation:** mega-menu driven by `settings.mega_menu` JSON with fallback to `src/lib/mega-menu-data.ts:1`; types in `src/lib/types.ts:73`
- **Product cards:** `ProductCard` / `ProductGrid` / `CollectionSlider` with badges (`new`/`sale`/`bestseller`), discount calculation (`src/lib/utils.ts:1`)
- **Accessibility & polish:** `Skip`? No — but `globals.css:31` respects `prefers-reduced-motion`, `PageTransition` (`src/components/PageTransition.tsx`), `ErrorBoundary` / `PageErrorBoundary`, `loading.tsx` and `error.tsx` per route

### 2. Product Catalog & Variants

- **Types:** `Product` + `ProductVariant` (`src/lib/types.ts:1`): handle, title, price, `compareAtPrice`, images, category (`men`/`women`/`accessories`), collection[], tags, sizes, colors, badges, stock, `variants`, `available_sizes`, `flash_sale`, fabric fields, `what_you_get`, `size_fit_text`
- **Fallback data:** `src/lib/data.ts:3` seeds 18 products + 3 `blogPosts` for local dev without DB
- **Variant system:** server aggregates `product_variants` per product (`src/app/api/products/route.ts:25`); exposes `stock` (sum) and `availableSizes` (size → stock). When variant system is active but a product has zero rows, it is treated as out-of-stock to avoid stale `products.stock`
- **Product page** (`src/app/products/[handle]/page.tsx:22`): image gallery with `ImageZoom`, swipe/drag thumbnails, size/color selection, quantity, `StickyAddToCart`, delivery pincode check (`src/app/api/delivery-check/route.ts`), stock alert signup (`src/app/api/stock-alerts/route.ts`), tabs (Size & Fit, Fabric & Care, Reviews, Shipping, Returns) driven by `store_settings` (`settings.product_*`), `FlashSaleTimer`/`CrossSellProducts`, `RecentlyViewed` tracking, JSON-LD (`src/components/JsonLd.tsx`)

### 3. Cart, Wishlist, Saved for Later, Compare

- **Cart store** (`src/lib/store.ts:8`): Zustand `persist` under key `marvvn-cart` (`src/lib/store.ts:317`), `skipHydration: true`
  - Actions: `addItem` (dedup by `product.id+size+color`, clamp qty 99, `trackAddToCart`), `removeItem`, `updateQuantity`, `clearCart`, `saveForLater` / `moveToCart` (moves between `items` and `savedItems`), `toggleCart`, `applyPromoCode` (POST `/api/coupons/validate`), `totalItems`/`totalPrice`/`finalPrice`
  - Sync: `syncToServer` POSTs to `/api/cart` (`src/lib/store.ts:32`), `syncSavedToServer` to `/api/saved-items` (`src/lib/store.ts:62`), `loadFromServer`/`loadSavedFromServer` hydrates from DB + re-hydrates `Product` objects via `/api/products`
- **Wishlist store** (`src/lib/wishlist-store.ts:1`): analogous persist + `/api/wishlist`
- **Server persistence:** `cart_items` (unique `user_id, product_id, size, color`), `wishlist_items`, `saved_items` tables with RLS per user (`supabase/schema.sql:104`)
- **UI:** `CartDrawer` (`src/components/CartDrawer.tsx`), `StickyAddToCart`, `UpsellProducts`, `Compare` page (`src/app/compare/`)

### 4. Search & Discovery

- **Search modal** (`src/components/SearchModal.tsx`): debounced fetch to `/api/products` + `/api/shop` search, keyboard navigation
- **Search utils** (`src/lib/search-utils.ts:1`): ranking, fuzzy match on title/handle/tags
- **Collections** (`src/app/collections/`): `women`, `men`, `accessories`, `new-arrivals`, `best-sellers`, `premium` etc., derived from `product.collection` arrays
- **Infinite scroll** (`src/components/InfiniteScroll.tsx`) for collection pagination

### 5. Checkout & Payments

- **Checkout page** (`src/app/checkout/page.tsx:18`): multi-step (contact → shipping → payment), saved addresses (`src/app/api/addresses/route.ts`), gift message/order notes, promo code input, shipping fee threshold (`settings.free_shipping_threshold` default 999, `settings.shipping_fee` default 65, `src/app/checkout/page.tsx:26`), Razorpay script lazy-load with Brave/ad-blocker handling (`src/app/checkout/page.tsx:60`), `trackBeginCheckout`
- **Payment API:**
  - `POST /api/payment` — creates Razorpay order
  - `POST /api/payment/verify` — HMAC signature verification
  - `POST /api/payment/webhook` — idempotent webhook handler
  - CSP allows `checkout.razorpay.com`, `api.razorpay.com`, `lumberjack.razorpay.com` (`next.config.js:24`)
- **Orders:** `POST /api/orders` persists `orders` + `order_items`; `GET /api/orders` lists user orders; `src/app/account/orders/page.tsx:1` shows history; `src/app/track-order/` for guest tracking
- **Post-purchase:** `src/app/api/invoice/route.ts` PDF generation (`InvoiceButton`), `src/app/api/cancel-order/route.ts`, `src/app/api/returns/route.ts`

### 6. Authentication & Account

- **Supabase Auth** (`src/lib/supabase/client.ts:3`, `server.ts:4`, `middleware.ts:1`, `src/lib/supabase/admin.ts:3`):
  - Browser client via `@supabase/ssr` `createBrowserClient`
  - Server client via `createServerClient` with `cookies()` adapter (`src/lib/supabase/server.ts:12`)
  - Admin client via `createClient` with `SUPABASE_SERVICE_ROLE_KEY` (`src/lib/supabase/admin.ts:3`)
- **Auth routes** (`src/app/api/auth/`): `register`, `login`, `logout`, `me`, `forgot-password`, `reset-password`, `social` (OAuth), `sync-profile`
- **Auth store** (`src/lib/auth-store.ts:1`): `isAuthenticated`, `user`, `logout`; `AuthCodeHandler` (`src/components/AuthCodeHandler.tsx`) exchanges OAuth code
- **Account pages** (`src/app/account/`): `page.tsx` (profile), `orders/`, `addresses/` (`AddressesManager`), `forgot-password`, `reset-password`, `login`, `register` — each with `error.tsx`/`loading.tsx`
- **API:** `src/app/api/account/profile`, `stats`, `delete` (GDPR-style)

### 7. Admin Panel (`src/app/admin/`)

Protected by `src/app/admin/layout.tsx:1`: fetches `GET /api/admin/check` (`src/app/api/admin/check/route.ts:1`) which checks `profiles.is_admin`; redirects to `/` or `/account/login`. Sidebar groups (`src/app/admin/layout.tsx:18`):

| Group | Routes | Purpose |
|---|---|---|
| Overview | `/admin` (`page.tsx:23` stats: revenue, AOV, pending, products, orders, users; 7-day revenue chart; status breakdown; top products; payment methods; promo usage; recent orders), `/admin/analytics` (BarChart3) | Dashboard |
| Catalog | `/admin/products` (list), `/admin/products/new`, `/admin/products/[id]`, `/admin/products/import`, `/admin/products/bulk` (bulk ops), `/admin/banners` | Product CRUD, image upload via `MultiImageUpload`, variant inventory |
| Sales | `/admin/orders` + `[id]`, `/admin/customers` + `[id]`, `/admin/coupons`, `/admin/abandoned-carts`, `/admin/whatsapp-campaigns`, `/admin/instagram`, `/admin/instagram-posts` | Order lifecycle, customer 360, coupons, cart recovery, campaigns, IG sync |
| Content | `/admin/blogs`, `/admin/reviews`, `/admin/messages` (contact) | CMS |
| Operations | `/admin/support` (tickets + reply), `/admin/inventory` / `low-stock`, `/admin/returns`, `/admin/mega-menu` (JSON editor for `store_settings.mega_menu`), `/admin/settings` | Ops & config |

Notable admin features:

- **Reset Stats** (`src/app/admin/page.tsx:40`, `src/app/api/admin/reset-stats/route.ts`): deletes `orders`/`order_items` only, keeps products & users; guard requires typing `RESET`
- **Mega Menu editor** (`src/app/admin/mega-menu/page.tsx`): edits `settings.mega_menu` JSON used by `Header` (`src/components/Header.tsx:46`)
- **Settings** (`src/app/admin/settings/page.tsx`, `src/app/api/admin/settings/route.ts:1`): key/value store `store_settings` (announcement bar, logos, thresholds, promo banners, About section, Brand Story image, footer links, etc.)
- **Upload** (`src/app/api/admin/upload/route.ts`): Supabase Storage upload for product/banner images
- **Inventory** (`src/app/api/admin/inventory/route.ts`, `low-stock/route.ts`): variant stock overview, low-stock alerts (`supabase/product-variants-migration.sql`)

### 8. Content & Marketing

- **Blogs:** DB table `blogs` (`supabase/blogs-migration.sql`), admin CRUD (`src/app/api/admin/blogs/route.ts`), public `GET /api/blogs`, `GET /api/seed-blogs`, pages `src/app/blogs/` (listing) + `src/app/blog/[handle]/`
- **Banners:** `GET /api/banners` (`src/app/api/banners/route.ts:1`) feeds `HeroBanner` + `PromoBanner` slots (`promo_4_*` in `src/app/page.tsx:31`)
- **Reviews:** `src/app/api/reviews/route.ts`, `product/route.ts`, `src/app/api/admin/reviews/route.ts`; `ProductReviews`, `ReviewsSection`, `featured-reviews-migration.sql` + `seed-featured-reviews.sql`
- **AboutSection:** editable brand story, value icons, brand image via `store_settings` (`src/components/AboutSection.tsx`)
- **Instagram:** `src/lib/instagram-commerce.ts`, `src/app/api/instagram-posts/route.ts`, admin sync (`src/app/api/admin/instagram-sync/route.ts`) + feed (`InstagramFeed`); storage via `instagram-sync-migration.sql`

### 9. Communications

- **Email:** `src/lib/email.ts:1` (Resend), `src/lib/scheduled-emails.ts:1`, `supabase/scheduled-emails-migration.sql`, `src/app/api/cron/process-emails/route.ts` (daily via `vercel.json:8`), contact `src/app/api/contact/route.ts`, newsletter `src/app/api/newsletter/route.ts`
- **WhatsApp:** `src/lib/whatsapp.ts:1`, `supabase/whatsapp-campaigns-migration.sql`, admin campaigns (`src/app/admin/whatsapp-campaigns/page.tsx`), catalog URL in `src/app/page.tsx:117`
- **Chat:** `ChatBot` (`src/components/ChatBot.tsx`) backed by `POST /api/chat` (Google Generative AI), `LiveChat` (`src/components/LiveChat.tsx`), support tickets (`src/app/api/support/tickets/route.ts`, `chat/route.ts`, `reply/route.ts`)
- **Abandoned carts:** `supabase/cart-abandonment-migration.sql`, `src/app/api/cart-abandonment/route.ts`, `src/app/api/admin/abandoned-carts/route.ts`, `src/app/admin/abandoned-carts/page.tsx`

### 10. Analytics & Operations Extras

- **Analytics** (`src/components/Analytics.tsx`): `AnalyticsScripts`, `Analytics`, `Pixel`; events `trackAddToCart`, `trackViewItem`, `trackBeginCheckout`; `src/app/api/analytics/top-sizes/route.ts`
- **Stock alerts:** `src/app/api/stock-alerts/route.ts` + `check/route.ts`
- **Delivery check:** `src/app/api/delivery-check/route.ts` (pincode → estimate)
- **Coupons:** `supabase/coupons-migration.sql`, `src/app/api/coupons/validate/route.ts`

---

## Project Structure

```
MARVVN/
├── public/
│   ├── images/               # product / banner SVGs
│   ├── icons/image_logo_circle.png
│   └── manifest.json         # PWA (src/app/layout.tsx:48) — name, standalone, icons 192/512
├── supabase/
│   ├── schema.sql            # core tables + RLS + seed 20 products (supabase/schema.sql:5)
│   ├── admin-migration.sql / profile-trigger-migration.sql
│   ├── blogs-migration.sql / seed-blogs.sql
│   ├── coupons-migration.sql / featured-reviews-migration.sql / features-migration-1.sql
│   ├── product-variants-migration.sql / product-attributes-migration.sql / product-what-you-get-migration.sql
│   ├── cart-abandonment-migration.sql / saved-items-migration.sql / whatsapp-campaigns-migration.sql
│   ├── orders-fix-migration.sql / fix-order-items-rls.sql / order-notes-migration.sql / tracking-number-migration.sql
│   ├── support-migration.sql / contact-messages-migration.sql / newsletter-migration.sql
│   ├── scheduled-emails-migration.sql / rate-limits-migration.sql / instagram-sync-migration.sql
│   ├── settings-migration.sql / storage-public-access.sql / ...
│   └── migrations/           # ordered migrations folder
├── src/
│   ├── app/
│   │   ├── layout.tsx        # fonts (Inter, Playfair), metadata, JSON-LD, lazysizes, providers (src/app/layout.tsx:64)
│   │   ├── page.tsx          # homepage (src/app/page.tsx:22)
│   │   ├── globals.css       # Tailwind base + components (btn-primary etc.) + utilities (globals.css:1)
│   │   ├── loading.tsx / error.tsx / global-error.tsx / not-found.tsx
│   │   ├── sitemap.ts        # sitemap: static + products + blogs (src/app/sitemap.ts:25)
│   │   ├── robots.ts         # allow /, disallow /admin /api /account /checkout (src/app/robots.ts:7)
│   │   ├── icon.png / feed.xml/ / sitemap.xml/
│   │   ├── maintenance/      # rewritten to by middleware when store_settings.maintenance_mode = true
│   │   ├── middleware.ts     # re-export? actually src/middleware.ts:1 handles maintenance gate
│   │   ├── account/          # login, register, forgot/reset-password, page, orders, addresses
│   │   ├── admin/            # layout + 20 sections (see Features §7)
│   │   ├── api/              # 70+ handlers (see API Reference)
│   │   ├── products/[handle]/, collections/, cart/, checkout/, wishlist/, compare/, search/, track-order/
│   │   ├── blogs/, blog/, policies/, pages/, support/
│   │   └── auth/             # callback handlers
│   ├── components/
│   │   ├── Header.tsx / Footer.tsx / HeroBanner.tsx / PromoBanner.tsx / ShopByGender.tsx
│   │   ├── ProductCard.tsx / ProductGrid.tsx / CollectionSlider.tsx / ProductForm.tsx
│   │   ├── CartDrawer.tsx / QuickViewModal.tsx / SearchModal.tsx / SizeGuide.tsx
│   │   ├── ImageZoom.tsx / LazyImage.tsx / MultiImageUpload.tsx / InfiniteScroll.tsx
│   │   ├── ProductReviews.tsx / ReviewsSection.tsx / InstagramFeed.tsx / BlogSection.tsx
│   │   ├── Analytics.tsx / JsonLd.tsx / SupabaseProvider.tsx / SettingsProvider.tsx
│   │   ├── ChatBot.tsx / LiveChat.tsx / TrustBadges.tsx / FeaturesBar.tsx / AboutSection.tsx
│   │   ├── InvoiceButton.tsx / StickyAddToCart.tsx / UpsellProducts.tsx / RecentlyViewed.tsx
│   │   └── ... (45 files total)
│   ├── lib/
│   │   ├── supabase/         # client.ts:3 (browser), server.ts:4 (SSR cookies), admin.ts:3 (service role), middleware.ts
│   │   ├── hooks/            # useProducts.ts:7 (fetch /api/products, /api/products/[handle]), useCurrency etc.
│   │   ├── store.ts          # cart Zustand (src/lib/store.ts:8)
│   │   ├── wishlist-store.ts / auth-store.ts
│   │   ├── types.ts          # Product, ProductVariant, CartItem, BlogPost, MegaMenu* (src/lib/types.ts:1)
│   │   ├── data.ts           # fallback products + blogPosts (src/lib/data.ts:3)
│   │   ├── utils.ts / sanitize.ts / search-utils.ts / rate-limit.ts / api-handler.ts
│   │   ├── email.ts / scheduled-emails.ts / whatsapp.ts / instagram-commerce.ts
│   │   ├── inventory.ts / server-settings.ts / mega-menu-data.ts
│   │   └── i18n/             # next-intl config
│   └── __tests__/            # api-cancel-order, api-coupons, store, utils + setup.ts (src/__tests__/setup.ts:1)
├── next.config.js            # unoptimized images, remotePatterns **, no-store cache + CSP (next.config.js:10)
├── tailwind.config.ts        # marvvn palette, Inter/Playfair, container padding, xs/sm/md/lg/xl/2xl (tailwind.config.ts:9)
├── postcss.config.js / .eslintrc.json / tsconfig.json
├── vitest.config.mts         # jsdom, globals, setupFiles src/__tests__/setup.ts, alias @→src (vitest.config.mts:6)
├── vercel.json               # crons 0 0 * * * for instagram-sync + process-emails (vercel.json:3)
└── package.json
```

---

## Data Models

Core interfaces in `src/lib/types.ts:1`:

```ts
interface Product {
  id: string; handle: string; title: string; description: string;
  price: number; compareAtPrice?: number; images: string[];
  category: 'men' | 'women' | 'accessories'; collection: string[]; tags: string[];
  sizes: string[]; colors: string[]; isNew?: boolean; isBestseller?: boolean;
  badge?: 'new' | 'sale' | 'bestseller' | null;
  stock?: number; low_stock_threshold?: number; variants?: ProductVariant[];
  available_sizes?: { size: string; stock: number }[];
  flash_sale?: boolean; flash_sale_price?: number; flash_sale_ends_at?: string;
  fabric_composition?: string; gsm?: string; waist?: string; length?: string;
  model_info?: string; what_you_get?: { icon: string; title: string; subtitle: string }[];
  size_fit_text?: string;
}
interface ProductVariant { id: string; product_id: string; size: string; color: string; stock: number; sku?: string; }
interface CartItem { product: Product; quantity: number; size: string; color: string; }
interface BlogPost { id: string; handle: string; title: string; excerpt: string; image: string; date: string; author: string; tags: string[]; }
interface MegaMenuSection { title: string; columns: MegaMenuColumn[]; featuredImage?: { src, alt, href, label } }
```

Server rows map `snake_case` (`compare_at_price`, `is_new`, `is_bestseller`) to camelCase on the way out (`src/app/api/products/route.ts:56`).

---

## Database Schema & Migrations

### Core (supabase/schema.sql:5)

| Table | Key columns | Notes |
|---|---|---|
| `products` | `id uuid PK`, `handle text unique`, `title`, `description`, `price numeric`, `compare_at_price`, `images text[]`, `category check(men/women/accessories)`, `collection text[]`, `tags text[]`, `sizes text[]`, `colors text[]`, `is_new`, `is_bestseller`, `badge check(new/sale/bestseller)`, `created_at`, `updated_at` | Seed: 20 products (`supabase/schema.sql:129`) |
| `orders` | `id`, `user_id → auth.users`, `status check(pending/confirmed/shipped/delivered/cancelled)`, `total`, `discount`, `promo_code`, `shipping_address jsonb`, `payment_method`, `payment_status check(pending/paid/failed/refunded)` | User-scoped RLS |
| `order_items` | `id`, `order_id → orders`, `product_id → products`, `quantity`, `size`, `color`, `price` |  |
| `cart_items` | `id`, `user_id`, `product_id`, `quantity`, `size`, `color`, `unique(user_id, product_id, size, color)` | Persistent cart |
| `wishlist_items` | `id`, `user_id`, `product_id`, `unique(user_id, product_id)` |  |
| `profiles` | `id → auth.users PK`, `name`, `phone`, `is_admin bool` (added via `admin-migration.sql`) | Extends auth |

### Added by migrations (supabase/*.sql)

- `product_variants` (`product-variants-migration.sql`): `id, product_id, size, color, stock, sku` — stock source of truth
- `blogs` (`blogs-migration.sql`): `id, handle, title, excerpt, image, date, author, tags`
- `coupons` (`coupons-migration.sql`): `code, discount_value, valid` — validated at `src/app/api/coupons/validate/route.ts`
- `store_settings` (`settings-migration.sql`): `key text PK, value text` — powers banners, mega-menu, announcement bar, thresholds, About section, etc. Accessed via `SettingsProvider` + `src/lib/server-settings.ts`
- `contact_messages`, `newsletter_subscribers`, `support_tickets` + `support_messages`, `reviews`/`featured_reviews`, `scheduled_emails`, `abandoned_carts`, `saved_items`, `whatsapp_campaigns`, `instagram_posts`, `rate_limits`, `addresses` (`product-attributes-migration.sql` adds `fabric_composition, gsm, waist, length, model_info, what_you_get`, etc.)
- Indexes: `idx_products_handle`, `category`, `collection GIN`, `orders_user_id`, etc. (`supabase/schema.sql:121`)
- RLS: enabled on all tables (`supabase/schema.sql:82`); policies: public read on `products`, per-user on `orders`/`order_items`/`cart_items`/`wishlist_items`/`profiles` (`supabase/schema.sql:90`); `fix-order-items-rls.sql` tightens order_items

Apply order: `schema.sql` first, then `*-migration.sql` files in alphabetical / timestamp order via Supabase SQL Editor or `supabase db push` if linked.

---

## API Reference

Base: `/api` — all handlers are Next.js Route Handlers (`route.ts`). Auth uses Supabase cookies; admin routes verify `profiles.is_admin`.

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/products` | GET | public | List products with `?limit=&offset=`, computes `stock` + `availableSizes` from `product_variants` (`src/app/api/products/route.ts:5`) |
| `/api/products/[handle]` | GET | public | Single product by handle |
| `/api/banners` | GET | public | Storefront banners |
| `/api/blogs` | GET | public | Blog listing (DB-backed) |
| `/api/settings` | GET | public | Public `store_settings` |
| `/api/shop/feed` | GET | public | Product feed for external sync |
| `/api/instagram-posts` | GET | public | Public IG feed |
| `/api/reviews` | GET/POST | public / auth | List/create reviews |
| `/api/reviews/product` | GET | public | Reviews by product |
| `/api/og` | GET | public | OG image generation |
| `/api/auth/register` | POST | public | Create user + profile |
| `/api/auth/login` | POST | public | Email/password login |
| `/api/auth/logout` | POST | auth | Sign out |
| `/api/auth/me` | GET | auth | Current user |
| `/api/auth/forgot-password` | POST | public | Send reset email |
| `/api/auth/reset-password` | POST | public | Reset with token |
| `/api/auth/social` | POST | public | OAuth handler |
| `/api/auth/sync-profile` | POST | auth | Sync `profiles` row |
| `/api/account/profile` | GET/PUT | auth | Read/update profile |
| `/api/account/stats` | GET | auth | Order stats for account |
| `/api/account/delete` | DELETE | auth | Delete account (GDPR) |
| `/api/addresses` | GET/POST/PUT/DELETE | auth | CRUD saved addresses (`src/app/api/addresses/route.ts:1`) |
| `/api/cart` | GET/POST/DELETE | auth | Server cart (persist, merge, clearAll) |
| `/api/saved-items` | GET/POST/DELETE | auth | Save-for-later |
| `/api/wishlist` | GET/POST/DELETE | auth | Wishlist |
| `/api/coupons/validate` | POST | public | Validate promo code (`{ code }` → `{ valid, code, discount_value }`, used by `src/lib/store.ts:225`) |
| `/api/orders` | GET/POST | auth | List / create orders (`{ items, shipping, payment, promo }`) |
| `/api/payment` | POST | auth | Create Razorpay order |
| `/api/payment/verify` | POST | auth | Verify Razorpay signature |
| `/api/payment/webhook` | POST | webhook | Razorpay webhook (HMAC) |
| `/api/invoice` | GET | auth | Generate invoice PDF |
| `/api/track-order` | GET | public | Guest order tracking `?orderId=&email=` |
| `/api/cancel-order` | POST | auth | Cancel own order |
| `/api/returns` | GET/POST | auth | Returns listing + create |
| `/api/delivery-check` | GET | public | `?pincode=6digits` → delivery estimate |
| `/api/stock-alerts` | POST | public | Subscribe `{ productId, email }` |
| `/api/stock-alerts/check` | GET | public | Check alert status |
| `/api/contact` | POST | public | Contact form → `contact_messages` + email |
| `/api/newsletter` | POST | public | Subscribe email |
| `/api/support/tickets` | GET/POST | auth | List/create tickets |
| `/api/support/tickets/[id]` | GET | auth | Ticket detail |
| `/api/support/chat` | POST | auth | Ticket chat message |
| `/api/support/reply` | POST | auth | Reply to ticket |
| `/api/chat` | POST | public | AI ChatBot (Gemini) |
| `/api/cart-abandonment` | POST | public | Record abandonment event |
| `/api/analytics/top-sizes` | GET | public | Top sizes analytics |
| `/api/seed` | POST | admin | Seed products |
| `/api/seed-blogs` | POST | admin | Seed blogs (`src/app/api/seed-blogs/route.ts:1`) |
| `/api/cron/instagram-sync` | GET | cron | Daily IG sync (`vercel.json:4`) |
| `/api/cron/process-emails` | GET | cron | Daily scheduled email flush (`vercel.json:8`) |
| **Admin** ||| |
| `/api/admin/check` | GET | auth | `{ isAdmin }` gate (`src/app/api/admin/check/route.ts:1`) |
| `/api/admin/stats` | GET | admin | Dashboard stats (revenue, orders, status breakdown, top products) (`src/app/api/admin/stats/route.ts:1`) |
| `/api/admin/analytics` | GET | admin | Extended analytics |
| `/api/admin/products` | GET/POST | admin | List/create products |
| `/api/admin/products/[id]` | GET/PUT/DELETE | admin | Single product |
| `/api/admin/products/bulk` | POST | admin | Bulk update |
| `/api/admin/products/import` | POST | admin | CSV import |
| `/api/admin/orders` | GET | admin | All orders |
| `/api/admin/orders/[id]` | GET/PUT | admin | Update order status |
| `/api/admin/customers` | GET | admin | Customer list |
| `/api/admin/coupons` | GET/POST/PUT/DELETE | admin | Coupon CRUD |
| `/api/admin/blogs` | GET/POST/PUT/DELETE | admin | Blog CRUD |
| `/api/admin/reviews` | GET/PUT/DELETE | admin | Review moderation |
| `/api/admin/messages` | GET | admin | Contact messages |
| `/api/admin/support` | GET | admin | All tickets |
| `/api/admin/support/[id]` | GET | admin | Ticket detail |
| `/api/admin/support/reply` | POST | admin | Admin reply |
| `/api/admin/inventory` | GET | admin | Variant inventory |
| `/api/admin/low-stock` | GET | admin | Low-stock alerts |
| `/api/admin/abandoned-carts` | GET | admin | Abandoned carts |
| `/api/admin/instagram-sync` | POST | admin | Trigger IG sync |
| `/api/admin/instagram-posts` | GET/POST/DELETE | admin | IG post CRUD |
| `/api/admin/whatsapp-campaigns` | GET/POST | admin | Campaign CRUD |
| `/api/admin/settings` | GET/POST | admin | `store_settings` upsert |
| `/api/admin/upload` | POST | admin | Storage upload |
| `/api/admin/reset-stats` | POST | admin | Delete orders, zero revenue (`{ confirm: "RESET", scope: "orders" }`, `src/app/api/admin/reset-stats/route.ts:1`) |

---

## State Management

- **Cart** — `useCartStore` (`src/lib/store.ts:91`): `persist` middleware, name `marvvn-cart`, `partialize` keeps `items/savedItems/promoCode/discount`. Server sync on every mutation (`syncToServer`/`syncSavedToServer`). Clamp qty 0–99, dedup by triple key. `finalPrice` applies percentage discount.
- **Wishlist** — `useWishlistStore` (`src/lib/wishlist-store.ts`): same pattern, badge count via `totalItems()`, used in `Header` (`src/components/Header.tsx:42`)
- **Auth** — `useAuthStore` (`src/lib/auth-store.ts`): `user`, `isAuthenticated`, `logout`; hydrated from `GET /api/auth/me` + Supabase session; `SupabaseProvider` (`src/components/SupabaseProvider.tsx`) + `AuthCodeHandler`
- **Settings** — `SettingsProvider` (`src/components/SettingsProvider.tsx`): fetches `GET /api/settings` once, provides `store_settings` (announcement bar, logo, thresholds, `mega_menu`, `promo_4_*`, `product_*` texts) to `Header`, `Home` (`src/app/page.tsx:23`), `ProductPage` etc.

---

## Styling & Design System

- **Tokens** (`tailwind.config.ts:9`): `marvvn.black #000`, `white #FFF`, `gray 50–900`, `red #E53E3E`, `gold #D4A843`; fonts `sans: var(--font-inter)` / `display: var(--font-playfair)`; `container` centered with responsive padding; breakpoints `xs 480` … `2xl 1440`
- **Fonts** (`src/app/layout.tsx:15`): `Inter` + `Playfair_Display` via `next/font/google` with CSS variables ` --font-inter` / `--font-playfair`
- **Base** (`src/app/globals.css:5`): `*` border default, body `bg-white text-marvvn-black antialiased`, `overflow-x: clip`, smooth scroll, `prefers-reduced-motion` guard
- **Components** (`src/app/globals.css:47`):
  - `.btn-primary` — black bg, white text, uppercase `text-xs font-bold tracking-widest`, hover `black/80`
  - `.btn-secondary` / `.btn-outline` — transparent/black border, hover invert
  - `.section-title` `text-3xl/4xl/5xl font-bold tracking-tight`
  - `.product-card` / `.product-image` (`aspect-[3/4]`, hover `scale-105`) / `.product-badge` (top-left black)
  - `.input-field` — `border-black/20`, focus `border-black ring-1`
  - `.page-content` — `pt-7rem` mobile / `8rem` desktop to offset fixed header (`src/app/globals.css:165`)
- **Utilities:** `text-balance`, `animate-fade-in/slide-up/marquee/slide-down`, `scrollbar-hide`, `line-clamp-2/3`, `.marquee-container` (20s linear, pause on hover)

---

## Authentication & Authorization

1. **Browser:** `createBrowserClient` (`src/lib/supabase/client.ts:3`) stores session in cookies (`sb-<project>-auth-token`, chunked `.0..9` if large, `src/middleware.ts:18`)
2. **Server:** `createServerClient` with `cookies()` adapter (`src/lib/supabase/server.ts:12`) for Route Handlers and Server Components
3. **Admin:** `createAdminClient` (`src/lib/supabase/admin.ts:3`) with `SUPABASE_SERVICE_ROLE_KEY`, `autoRefreshToken: false` — bypasses RLS for writes
4. **Admin gate:** `GET /api/admin/check` reads `profiles.is_admin`; `src/app/admin/layout.tsx:28` fetches it on mount and redirects non-admins to `/`
5. **Maintenance gate:** `src/middleware.ts:46` (see below) checks `store_settings.maintenance_mode` and decodes JWT payload to verify `is_admin`

---

## Security

- **Row Level Security:** enabled on `products`, `orders`, `order_items`, `cart_items`, `wishlist_items`, `profiles` (`supabase/schema.sql:82`); policies enforce public product reads and per-user isolation for the rest; `fix-order-items-rls.sql` corrects order_items policy to `EXISTS (select 1 from orders where id = order_id and user_id = auth.uid())`
- **Content Security Policy** (`next.config.js:20`):
  ```
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com https://connect.facebook.net https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https: http: https://*.razorpay.com;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com https://www.google-analytics.com https://analytics.google.com https://graph.facebook.com ...;
  frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://www.google.com https://connect.facebook.net;
  ```
- **Cache-Control:** `no-store, must-revalidate` on all non-static routes so middleware always executes (`next.config.js:14`)
- **Rate limiting:** `src/lib/rate-limit.ts:3` backed by `rate_limits` table (`rate-limits-migration.sql`): sliding window (`maxRequests`, `windowMs` default 10/60s), used in `src/lib/api-handler.ts` + auth/contact handlers
- **Sanitization:** `src/lib/sanitize.ts` strips XSS for user-generated content (reviews, messages, tickets)
- **Secrets:** service role key never exposed to client; only `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public

---

## SEO, Performance & PWA

- **Metadata** (`src/app/layout.tsx:25`): `title` default + template, `description`, `keywords`, `metadataBase` from `NEXT_PUBLIC_SITE_URL`, `openGraph`, `icons`, `manifest`, `appleWebApp`; fonts preloaded via `next/font`
- **Structured data** (`src/app/layout.tsx:95`): `Organization` + `WebSite` with `SearchAction` JSON-LD; per-product `ProductJsonLd` + `BreadcrumbJsonLd` (`src/components/JsonLd.tsx`) on `src/app/products/[handle]/page.tsx`
- **Sitemap** (`src/app/sitemap.ts:25`): static pages (home, collections, policies) + dynamic `products` + `blogs` via `GET /api/products` / `GET /api/blogs`, `revalidate 3600`
- **Robots** (`src/app/robots.ts:3`): `allow /`, `disallow /admin/ /api/ /account/ /checkout/`, `sitemap: /sitemap.xml`
- **Feeds:** `src/app/feed.xml/` RSS, `src/app/sitemap.xml/` alias
- **OG images:** `src/app/api/og/route.ts` dynamic generation
- **Images:** `next.config.js:3` `unoptimized: true`, `remotePatterns: https://**`; `lazysizes` + `blur-up` plugin (`src/app/layout.tsx:81`) with `expand 250, loadMode 1`
- **Performance:** `SpeedInsights` (`src/app/layout.tsx:92`), `Analytics` + `Pixel`, `next-nprogress-bar`, `framer-motion` for route transitions
- **PWA** (`public/manifest.json:1`): `name MARVVN - Premium Streetwear`, `short_name MARVVN`, `display standalone`, `background/theme_color #000000`, icons `192` + `512` + `maskable`, `categories shopping/fashion`, `start_url /`; `apple-touch-icon` in `src/app/layout.tsx:73`
- **Viewport** (`src/app/layout.tsx:56`): `themeColor #000000`, `width device-width`, `maximumScale 5`, `viewportFit cover`

---

## Internationalization

- `next-intl ^4.14.0` (`src/lib/i18n/`), `I18nProvider` in `src/app/layout.tsx:134`, `LanguageSwitcher` (`src/components/LanguageSwitcher.tsx`) in header; locale persistence via cookies; `locale en_IN` in `openGraph` (`src/app/layout.tsx:38`)

---

## Prerequisites

- Node.js 18+ (20 LTS recommended) — `next 14.2` peer requirement
- npm 9+ (or pnpm/yarn, but `package-lock.json` is checked in)
- Supabase project (https://supabase.com) — Postgres + Auth + Storage
- Razorpay account for payments (key id + secret)
- Optional: Google Generative AI API key (ChatBot), Resend API key (email), Instagram Graph token, GA / FB Pixel IDs

---

## Installation & Local Development

```bash
# 1. Clone
git clone https://github.com/your-org/MARVVN.git
cd MARVVN

# 2. Install
npm install

# 3. Env
cp .env.local.example .env.local
# then edit .env.local — see Environment Variables below

# 4. Database — run in Supabase SQL Editor (in order)
#    supabase/schema.sql
#    supabase/*-migration.sql  (or supabase db push if linked)

# 5. Dev server
npm run dev
# → http://localhost:3000
```

The homepage fetches `GET /api/products`; without DB it falls back to `src/lib/data.ts:3` sample data.

---

## Environment Variables

Create `.env.local` at the repo root. Variables prefixed `NEXT_PUBLIC_` are exposed to the browser.

| Variable | Required | Where used | Example |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | `src/lib/supabase/*.ts`, `src/middleware.ts:53` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | `client.ts:6`, `server.ts:6`, middleware REST fetch | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | `src/lib/supabase/admin.ts:4` (admin writes) | `eyJ...` |
| `GEMINI_API_KEY` | optional | `src/app/api/chat/route.ts` (ChatBot) | `AIza...` |
| `NEXT_PUBLIC_SITE_URL` | recommended | `src/app/layout.tsx:32` `metadataBase`, `sitemap.ts:3`, `robots.ts:4` | `https://marvvn.online` |
| `RAZORPAY_KEY_ID` | for checkout | `src/app/api/payment/route.ts:1` + client script | `rzp_xxx` |
| `RAZORPAY_KEY_SECRET` | for checkout | `verify` + `webhook` HMAC | `xxx` |
| `RESEND_API_KEY` | for email | `src/lib/email.ts:1`, scheduled emails | `re_xxx` |
| `NEXT_PUBLIC_GA_ID` | optional | `src/components/Analytics.tsx` | `G-xxx` |
| `NEXT_PUBLIC_FB_PIXEL_ID` | optional | `src/components/Analytics.tsx: Pixel` | `xxx` |
| `INSTAGRAM_ACCESS_TOKEN` | optional | `src/lib/instagram-commerce.ts:1` | `IGQ...` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` etc. | optional | `src/lib/whatsapp.ts:1`, `src/app/page.tsx:115` | `91...` |

Minimal template is ` .env.local.example:1`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

Never commit `.env.local` (ignored via `.gitignore:16`).

---

## Database Setup

1. Create a Supabase project and note `Project URL`, `anon key`, `service_role key` (Project Settings → API).
2. In SQL Editor, run `supabase/schema.sql:1` — creates `products`, `orders`, `order_items`, `cart_items`, `wishlist_items`, `profiles`, RLS, indexes, and seeds 20 products (`supabase/schema.sql:129`).
3. Run each `supabase/*-migration.sql` in order (or apply the `supabase/migrations/` folder via `supabase db push`). Important ones:
   - `admin-migration.sql` + `profile-trigger-migration.sql` — `profiles.is_admin` + auto-create trigger
   - `product-variants-migration.sql` — variant stock system
   - `blogs-migration.sql` + `seed-blogs.sql` — blog CMS
   - `settings-migration.sql` — `store_settings` table
   - `coupons-migration.sql`, `scheduled-emails-migration.sql`, `support-migration.sql`, `cart-abandonment-migration.sql`, `saved-items-migration.sql`, `whatsapp-campaigns-migration.sql`, `instagram-sync-migration.sql`, `rate-limits-migration.sql`
   - `storage-public-access.sql` — makes `product-images` bucket public
4. Create Storage bucket `product-images` (if not created by migration) and set public access.
5. (Optional) Set `store_settings` defaults via Admin → Settings or direct SQL: `insert into store_settings (key, value) values ('announcement_bar','Free shipping over ₹999') ...`.
6. Create an admin user: sign up at `/account/register`, then in SQL Editor: `update profiles set is_admin = true where id = '<user-uuid>';`
7. Verify RLS: `select * from products` should succeed anon; `select * from orders` should return only own rows.

---

## Scripts

| Command | Description | Config |
|---|---|---|
| `npm run dev` | Start Next.js dev server (Turbopack off) | `package.json:6` `next dev` |
| `npm run build` | Production build | `package.json:7` `next build` |
| `npm start` | Start production server | `package.json:8` `next start` |
| `npm run lint` | ESLint (next) | `package.json:9` `next lint` |
| `npm test` | Vitest single run | `package.json:10` `vitest run` |
| `npm run test:watch` | Vitest watch | `package.json:11` `vitest` |
| `npm run test:coverage` | Vitest with coverage | `package.json:12` `vitest run --coverage` |

---

## Testing

- **Runner:** Vitest (`vitest.config.mts:6`) — `environment jsdom`, `globals true`, `setupFiles ./src/__tests__/setup.ts`, `include src/**/*.{test,spec}.{ts,tsx}`, alias `@ → ./src`
- **Setup:** `src/__tests__/setup.ts:1` imports `@testing-library/jest-dom` and mocks `localStorage` for Zustand persist
- **Suites:**
  - `src/__tests__/store.test.ts` — cart store: add/dedup, saveForLater/moveToCart, promo, totals
  - `src/__tests__/utils.test.ts` — `formatPrice`, `calculateDiscount`, `cn`
  - `src/__tests__/api-coupons.test.ts` — `POST /api/coupons/validate` validation
  - `src/__tests__/api-cancel-order.test.ts` — cancel-order auth + ownership checks
- **Run:**
  ```bash
  npm test
  npm run test:watch
  npm run test:coverage
  ```

---

## Deployment

Deployed on **Vercel** from the `main` branch.

1. Import the repo in Vercel, set **Framework Preset: Next.js**.
2. Add all environment variables in Vercel → Project Settings → Environment Variables (Production + Preview).
3. Set `NEXT_PUBLIC_SITE_URL` to the production domain (`https://marvvn.online`).
4. No build overrides needed — `next build` is default.
5. **Cron** (`vercel.json:1`):
   ```json
   { "crons": [
     { "path": "/api/cron/instagram-sync", "schedule": "0 0 * * *" },
     { "path": "/api/cron/process-emails", "schedule": "0 0 * * *" }
   ] }
   ```
   Both run daily at midnight UTC. Ensure Vercel Cron is enabled and handlers verify `Authorization: Bearer <CRON_SECRET>` if you add one.
6. **Headers** (`next.config.js:10`): `Cache-Control: no-store, must-revalidate` on `/(?!_next/static|_next/image|favicon.ico).*` so `src/middleware.ts:1` always runs; CSP header as above.
7. **Images:** `unoptimized: true` (`next.config.js:4`) — Vercel image optimization off, `remotePatterns: https://**` allows any CDN.
8. After deploy, smoke-test: homepage → product → add to cart → checkout → admin login → `/admin` dashboard loads.

---

## Middleware & Maintenance Mode

`src/middleware.ts:1` is the only middleware (matcher `/(?!_next/static|_next/image|api|admin|favicon.ico|robots.txt|sitemap.xml|placeholder.png|maintenance).*`, `src/middleware.ts:4`):

1. Reads `store_settings` where `key = 'maintenance_mode'` via Supabase REST (`src/middleware.ts:53`), 4s timeout, `cache: no-store`. If column unreachable, it fails open (`NextResponse.next()`).
2. If `value !== 'true'`, passes through.
3. If `maintenance_mode = 'true'`, decodes Supabase JWT from cookies (`sb-<project>-auth-token` + chunked `.0..9`, `src/middleware.ts:18`) without signature verification, extracts `sub` (user id).
4. Fetches `profiles? id=eq.<userId> & select=is_admin` via REST with `Authorization: Bearer <access_token>` (`src/middleware.ts:109`), 3s timeout. If `is_admin === true`, passes through; otherwise `rewrite` to `/maintenance`.
5. No token or not admin → rewritten to `/maintenance` (`src/app/maintenance/page.tsx`). `Cache-Control: no-store` (`next.config.js:14`) guarantees this check on every navigation.

Toggle via Admin → Settings → `maintenance_mode` = `true`/`false` (`src/app/api/admin/settings/route.ts`).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Missing Supabase environment variables` | `.env.local` missing or not loaded | Copy `.env.local.example`, restart `npm run dev`; check `src/lib/supabase/server.ts:9` / `admin.ts:6` |
| Products not loading, empty homepage | DB empty or RLS blocking | Run `supabase/schema.sql:129` seed; check Supabase → Table Editor → `products` has rows; verify `Products are viewable by everyone` policy |
| Admin redirects to `/` | `profiles.is_admin` false | `update profiles set is_admin = true where id = '<uuid>';` and re-login to refresh JWT |
| Razorpay modal not opening | CSP or Brave Shields blocking `checkout.razorpay.com` | Check browser console, `next.config.js:25` CSP allows it; see `src/app/checkout/page.tsx:60` retry logic |
| Maintenance page shows for everyone including admin | JWT chunk missing or `profiles` fetch failed | Check cookies `sb-*-auth-token*`, verify `NEXT_PUBLIC_SUPABASE_URL` matches `src/middleware.ts:17` projectRef `vowubjguzgdbaircgdwq`; ensure anon key valid |
| Cron not firing | Vercel cron not enabled on Hobby | Upgrade or trigger manually via `curl https://marvvn.online/api/cron/process-emails` |
| `lazysizes` not loading images | CDN blocked | `src/app/layout.tsx:85` loads `5.3.2/lazysizes.min.js` + blur-up; check network tab |
| Tests fail `localStorage is not defined` | Missing setup | Ensure `vitest.config.mts:9` `setupFiles` points to `src/__tests__/setup.ts:1` |

---

## License

Private — all rights reserved. No license granted for reuse or distribution.
