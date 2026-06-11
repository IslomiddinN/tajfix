# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**TajFix** — a home-appliance repair + electronics marketplace for Tajikistan: repair **services** (book a master), an appliance **shop** (cart → checkout → order), and an **AI helper** for self-diagnosis. UI copy is in Russian. Prices are in Tajik somoni (сом).

As of the monorepo split, the product is **four separate Next.js apps** under `apps/*`, each deployed to its own domain, sharing one database and one codebase of helpers:

| App | Dir | Dev port | Routes it serves | Audience |
|-----|-----|----------|------------------|----------|
| **client** | `apps/client` | 3000 | public site: `/`, `/shop`, `/services`, `/masters`, `/cart`, `/checkout`, `/orders`, `/profile`, `/ai`, `/support`, `/login`, `/register` + their APIs | customers |
| **master** | `apps/master` | 3001 | `/master/*` + `/api/master/*` | repair masters |
| **seller** | `apps/seller` | 3002 | `/seller/*` + `/api/seller/*` | shops |
| **admin** | `apps/admin` | 3003 | `/admin/*` + `/api/admin/*` | staff/admins |

**URL paths are unchanged by the split** — each app keeps the same paths it had in the single app (e.g. admin still serves `/admin/...`), so internal links didn't need rewriting. Only **cross-app** links (client → admin/master/seller) go through `lib/appUrls.ts` `appHref(app, path)`, which builds an absolute URL from `NEXT_PUBLIC_<APP>_URL` (localhost ports in dev, real domains in prod).

> Note: the `~/CLAUDE.md` at the home directory describes a different project ("Зуд Биёр" grocery delivery). It does **not** apply here — this repo is TajFix.

## Commands

Run all commands from the **repo root** (npm workspaces). Prisma, deps, and `.env` live at the root and are shared by every app.

```bash
npm install              # installs once for all workspaces (deps hoist to root node_modules)
npm run dev              # dev server for the CLIENT app (alias of dev:client, port 3000)
npm run dev:client       # client app  → http://localhost:3000
npm run dev:master       # master app  → http://localhost:3001
npm run dev:seller       # seller app  → http://localhost:3002
npm run dev:admin        # admin app   → http://localhost:3003
npm run build            # builds ALL four apps in sequence (no live DB needed — see below)
npm run build:client     # build a single app (also build:master / :seller / :admin)
npm run lint             # next lint on the client app
npm run prisma:generate  # regenerate Prisma Client after editing schema.prisma
npm run prisma:migrate   # prisma migrate dev (creates/applies migrations)
npm run seed             # ts-node prisma/seed.ts — demo categories, services, products, masters
npx prisma studio        # inspect/edit DB
```

To work on more than one surface at once, run several `dev:*` scripts in separate terminals — they bind different ports. No test runner is configured.

After changing `prisma/schema.prisma`, run `prisma:generate` (and usually `prisma:migrate`) before the types resolve. **Stop the dev server first** — while it runs it holds a lock on the Prisma query-engine DLL on Windows, and `prisma generate` fails with `EPERM`.

`prisma migrate dev` is interactive and aborts in this non-interactive environment whenever it needs to confirm a warning (e.g. adding a unique constraint). Workaround: generate the SQL with `npx prisma migrate diff --from-url <DATABASE_URL> --to-schema-datamodel prisma/schema.prisma --script`, drop it into a new `prisma/migrations/<timestamp>_<name>/migration.sql` folder, then apply with `npx prisma migrate deploy`.

Seeded demo accounts (password `tajfix2026`): `admin@tajfix.local` (ADMIN), `user@tajfix.local` (USER), `master@tajfix.local` (MASTER — linked to the seeded master "Сорбон Ҳакимов" with a demo booking), `seller@tajfix.local` (SELLER — shop "Техномир Душанбе" owning a few seeded products).

## Architecture

Next.js 14 **App Router** + TypeScript, in an **npm-workspaces monorepo**. Tailwind for styling, `lucide-react` for icons, React Hook Form + Zod for forms, Prisma + PostgreSQL for data.

#### Monorepo layout

```
apps/{client,master,seller,admin}/   # 4 Next apps — each: app/, package.json, next.config.mjs, tsconfig.json, tailwind.config.ts, public/
lib/  components/  types/            # SHARED code — lives at repo ROOT, imported by every app
app-shell/                           # shared providers.tsx + theme-provider.tsx (the <Providers> wrapper)
styles/globals.css                   # shared global stylesheet + design tokens
prisma/                              # shared schema, migrations, seed (one DB for all apps)
tailwind-preset.ts                   # shared Tailwind theme (each app's config does presets:[preset] + its own content)
load-env.mjs                         # reads the single root .env into process.env (each next.config calls loadRootEnv())
```

- Shared code is **not** a published package. Each app's `tsconfig.json` maps `@/*` to `["./*", "../../*"]` (own dir first, then repo root), so existing imports like `@/lib/prisma`, `@/components/Header`, `@/app-shell/providers`, `@/styles/globals.css` resolve to the root files. Each `next.config.mjs` sets `experimental.externalDir: true` to allow importing those out-of-app files. **Add shared code to root `lib/`/`components/`, never inside one app.**
- **Pages** live in `apps/<app>/app/<route>/page.tsx`; **API handlers** in `apps/<app>/app/api/<route>/route.ts`.
- **Cross-app endpoint duplication**: each app only serves its own API routes, so endpoints needed by several apps are copied into each (`/api/auth/[...nextauth]` everywhere; `/api/categories` in seller+admin; `/api/profile*` in admin). The route files are thin and call into shared `lib/`, so logic stays single-sourced — keep it that way if you touch them.
- **Auth** is NextAuth Credentials provider with a **JWT session strategy** (`lib/authOptions.ts`). `id` and `role` are injected into the JWT and Session via callbacks. The `Session`/`JWT`/`User` types are augmented in `types/next-auth.d.ts` to carry `id` and `role` (`'USER' | 'ADMIN' | 'MASTER' | 'SELLER'`). Passwords are bcrypt-hashed.
  - **Sessions are per-domain** — a login on the client domain does not authenticate the admin domain. So **every app serves its own `/login`** (thin wrapper around the shared `components/LoginForm.tsx`, which reads `?callbackUrl=` and falls back to the app's section). The shared `NEXTAUTH_SECRET` lets all apps verify each other's JWTs; sharing the cookie across `*.tajfix.tj` subdomains in prod is a future enhancement (NextAuth `cookies.domain`).
  - In API routes, get the session with `getServerSession(authOptions)`. `lib/auth.ts` exposes a thin `getCurrentUser()` wrapper.
  - **RBAC** is enforced inline in each route, not via middleware — e.g. admin endpoints check `session.user.role !== 'ADMIN'` and return 403. Layouts gate the UI too (master via server `getServerSession`+`redirect`; admin/seller via client `useSession`, redirecting unauthenticated users to their own `/login`). Follow this same inline pattern when adding protected routes.
- **Prisma client** is a global singleton in `lib/prisma.ts` (prevents connection exhaustion in dev hot-reload). Import `{ prisma }` from there everywhere.

### Data model (prisma/schema.prisma)

The schema spans two business domains sharing one `User`:

- **Shop flow**: `Product` → `CartItem` (per user) → checkout creates a `ProductOrder` + `ProductOrderItem[]` and clears the cart. Item prices are snapshotted onto `ProductOrderItem.price` at checkout time.
- **Repair flow**: `Service` + optional `Master` → `RepairBooking`.
- `Master` optionally links to a `User` via `Master.userId` (`@unique`, one-to-one). A user with `role = MASTER` reaches their assigned bookings through this link — see the master app (`apps/master/app/master/page.tsx`) and `apps/master/app/api/master/bookings/*`, which resolve the master by `master.userId === session.user.id` before returning/mutating only that master's `RepairBooking`s.
- **Seller flow (multi-vendor)**: `Seller` links to a `User` via `Seller.userId` (`@unique`, one-to-one), and `Product.sellerId` is a *nullable* owner (admin-created products have none). A user with `role = SELLER` reaches their own products/sales through this link — see the seller app (`apps/seller/app/seller/*`, admin-style sidebar layout) and `apps/seller/app/api/seller/*`, resolved via `lib/seller.ts` `getCurrentSeller()` (`seller.userId === session.user.id`). Sellers self-register at `/seller/register` (`POST /api/seller/register` creates the `Seller` and flips the user's role to `SELLER`; the client calls NextAuth `update()` so the JWT picks up the new role without re-login — the `jwt` callback in `lib/authOptions.ts` re-reads the role on `trigger === 'update'`). An order can contain items from several sellers, so sellers **only view** their own `ProductOrderItem`s and toggle a per-item `fulfilled` flag (готовность к отгрузке); overall `ProductOrder.status` stays admin-controlled.
- `Category.type` is an enum (`SERVICE | PRODUCT`) that partitions categories across the two domains.
- Orders and bookings share the `OrderStatus` lifecycle: `NEW → CONFIRMED → IN_PROGRESS → COMPLETED → CANCELLED`.
- `Review` polymorphically references either a `Master` or a `Product` (both nullable).

### Build vs. runtime DB requirement

DB-backed pages and API routes are marked `export const dynamic = 'force-dynamic'`, so `npm run build` does **not** need a live database — it's only required at runtime. Preserve this marker on any new route that touches Prisma, or the build will try to statically render it and fail.

## Environment

There is **one** `.env` at the repo root, shared by all apps (each `apps/*/next.config.mjs` loads it via `load-env.mjs` → `loadRootEnv()`). It requires `DATABASE_URL` (PostgreSQL), `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`). For cross-app links, set `NEXT_PUBLIC_{CLIENT,MASTER,SELLER,ADMIN}_URL` (default to localhost ports in dev). Each app's `next.config.mjs` whitelists `images.unsplash.com` for remote images. See `.env.example`.
