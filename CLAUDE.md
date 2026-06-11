# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**TajFix** — a home-appliance repair + electronics marketplace for Tajikistan. Three product surfaces in one Next.js app: repair **services** (book a master), an appliance **shop** (cart → checkout → order), and an **AI helper** for self-diagnosis. UI copy is in Russian. Prices are in Tajik somoni (сом).

> Note: the `~/CLAUDE.md` at the home directory describes a different project ("Зуд Биёр" grocery delivery). It does **not** apply here — this repo is TajFix.

## Commands

```bash
npm run dev              # dev server (localhost:3000)
npm run build            # production build (does NOT need a live DB — see below)
npm run lint             # ESLint over .ts/.tsx
npm run prisma:generate  # regenerate Prisma Client after editing schema.prisma
npm run prisma:migrate   # prisma migrate dev (creates/applies migrations)
npm run seed             # ts-node prisma/seed.ts — demo categories, services, products, masters
npx prisma studio        # inspect/edit DB
```

No test runner is configured.

After changing `prisma/schema.prisma`, run `prisma:generate` (and usually `prisma:migrate`) before the types resolve. **Stop the dev server first** — while it runs it holds a lock on the Prisma query-engine DLL on Windows, and `prisma generate` fails with `EPERM`.

`prisma migrate dev` is interactive and aborts in this non-interactive environment whenever it needs to confirm a warning (e.g. adding a unique constraint). Workaround: generate the SQL with `npx prisma migrate diff --from-url <DATABASE_URL> --to-schema-datamodel prisma/schema.prisma --script`, drop it into a new `prisma/migrations/<timestamp>_<name>/migration.sql` folder, then apply with `npx prisma migrate deploy`.

Seeded demo accounts (password `tajfix2026`): `admin@tajfix.local` (ADMIN), `user@tajfix.local` (USER), `master@tajfix.local` (MASTER — linked to the seeded master "Сорбон Ҳакимов" with a demo booking), `seller@tajfix.local` (SELLER — shop "Техномир Душанбе" owning a few seeded products).

## Architecture

Next.js 14 **App Router** + TypeScript, single app (no monorepo). Tailwind for styling, `lucide-react` for icons, React Hook Form + Zod for forms, Prisma + PostgreSQL for data.

- **Pages** live in `app/<route>/page.tsx`; **API handlers** in `app/api/<route>/route.ts` (Route Handlers, not pages). Path alias `@/*` maps to repo root.
- **Auth** is NextAuth Credentials provider with a **JWT session strategy** (`lib/authOptions.ts`). `id` and `role` are injected into the JWT and Session via callbacks. The `Session`/`JWT`/`User` types are augmented in `types/next-auth.d.ts` to carry `id` and `role` (`'USER' | 'ADMIN' | 'MASTER'`). Passwords are bcrypt-hashed.
  - In API routes, get the session with `getServerSession(authOptions)`. `lib/auth.ts` exposes a thin `getCurrentUser()` wrapper.
  - **RBAC** is enforced inline in each route, not via middleware — e.g. admin endpoints check `session.user.role !== 'ADMIN'` and return 403. Follow this same inline pattern when adding protected routes.
- **Prisma client** is a global singleton in `lib/prisma.ts` (prevents connection exhaustion in dev hot-reload). Import `{ prisma }` from there everywhere.

### Data model (prisma/schema.prisma)

The schema spans two business domains sharing one `User`:

- **Shop flow**: `Product` → `CartItem` (per user) → checkout creates a `ProductOrder` + `ProductOrderItem[]` and clears the cart. Item prices are snapshotted onto `ProductOrderItem.price` at checkout time.
- **Repair flow**: `Service` + optional `Master` → `RepairBooking`.
- `Master` optionally links to a `User` via `Master.userId` (`@unique`, one-to-one). A user with `role = MASTER` reaches their assigned bookings through this link — see the master dashboard (`app/master/page.tsx`) and `app/api/master/bookings/*`, which resolve the master by `master.userId === session.user.id` before returning/mutating only that master's `RepairBooking`s.
- **Seller flow (multi-vendor)**: `Seller` links to a `User` via `Seller.userId` (`@unique`, one-to-one), and `Product.sellerId` is a *nullable* owner (admin-created products have none). A user with `role = SELLER` reaches their own products/sales through this link — see the seller cabinet (`app/seller/*`, admin-style sidebar layout) and `app/api/seller/*`, resolved via `lib/seller.ts` `getCurrentSeller()` (`seller.userId === session.user.id`). Sellers self-register at `/seller/register` (`POST /api/seller/register` creates the `Seller` and flips the user's role to `SELLER`; the client calls NextAuth `update()` so the JWT picks up the new role without re-login — the `jwt` callback in `lib/authOptions.ts` re-reads the role on `trigger === 'update'`). An order can contain items from several sellers, so sellers **only view** their own `ProductOrderItem`s and toggle a per-item `fulfilled` flag (готовность к отгрузке); overall `ProductOrder.status` stays admin-controlled.
- `Category.type` is an enum (`SERVICE | PRODUCT`) that partitions categories across the two domains.
- Orders and bookings share the `OrderStatus` lifecycle: `NEW → CONFIRMED → IN_PROGRESS → COMPLETED → CANCELLED`.
- `Review` polymorphically references either a `Master` or a `Product` (both nullable).

### Build vs. runtime DB requirement

DB-backed pages and API routes are marked `export const dynamic = 'force-dynamic'`, so `npm run build` does **not** need a live database — it's only required at runtime. Preserve this marker on any new route that touches Prisma, or the build will try to statically render it and fail.

## Environment

`.env` requires `DATABASE_URL` (PostgreSQL), `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`). `next.config.mjs` only whitelists `images.unsplash.com` for remote images.
