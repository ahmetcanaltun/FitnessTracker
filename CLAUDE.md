# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A self-hosted fitness + nutrition tracker (Turkish UI) for personal/family use.
Phase 1 (MVP) per `plan.md` §9 is implemented.

Two reference documents govern the work and are not application code:

- `plan.md` — the project specification. Source of truth for scope, schema, and phasing.
- `fitness-app-demo.jsx` — the binding visual reference prototype. Colors, fonts, and
  component behavior were ported from it. It is excluded from ESLint and never imported.

## Commands

```bash
docker compose up -d db      # Postgres on localhost:5433 (required for everything below)
npm run dev                  # dev server on :3000
npm run build                # production build
npm run lint                 # ESLint
npm run typecheck            # tsc --noEmit

npm run db:migrate           # prisma migrate dev — after editing schema.prisma
npm run db:studio            # browse data

npm run seed:exercises       # pull ~850 exercises from wger (idempotent upsert)
npm run seed:foods           # write the 77-item core food list (idempotent)
npm run seed:admin           # create first admin from ADMIN_EMAIL/ADMIN_PASSWORD
```

There is no test suite yet.

Production stack: `docker compose up -d app` builds and runs app + db + caddy. Seeds run
through the `tools` service: `docker compose run --rm tools npm run seed:exercises`.

## Version-specific constraints

The stack is newer than most training data — these bite immediately:

- **Next 16**: Turbopack is the default builder. `middleware` was renamed to **`proxy`**
  (`proxy.ts`, exporting `proxy`, nodejs runtime only). `params`, `searchParams`,
  `cookies()`, and `headers()` are async-only. `revalidateTag` requires a second
  cacheLife argument. Next ships agent docs at `node_modules/next/dist/docs/` — read them
  before changing framework-level behavior.
- **Tailwind v4**: there is no `tailwind.config.js`. Theme tokens live in the `@theme`
  block in `app/globals.css`; component classes live in `@layer components` there.
- **Prisma 7**: a driver adapter is mandatory (`@prisma/adapter-pg`) — the Rust query
  engine is gone. Config lives in `prisma.config.ts`, not in `schema.prisma`. The client
  is **generated TypeScript** into `lib/generated/prisma` (gitignored), so it must be
  regenerated after a fresh clone.

## Architecture

**External APIs are seed-time only.** wger (exercises) and Open Food Facts (Phase 3) are
called by `scripts/`, never by the running app. Everything the app reads is local. Do not
add request-time calls to those services.

**Users never hand-enter exercises or foods.** They search the pre-seeded catalog.
`scripts/wger-dictionary.ts` holds the static Turkish translation layer for wger's fixed
lists (categories, muscles, equipment); exercise *names* prefer wger's own Turkish
translation (language id 16), falling back to English.

**`lib/prisma.ts` exports a lazy Proxy, not a client.** `next build` imports page modules
without `DATABASE_URL` present, so connecting at import time breaks the Docker build. The
connection opens on first actual query. Keep it lazy.

**Meal rows snapshot their macros.** `saveMealEntry` multiplies out kcal/protein/carbs/fat
at write time and stores them on `MealEntry`, so correcting a `FoodItem` later never
rewrites history. Never recompute totals by joining to `FoodItem`.

**Dates are pinned to UTC midnight.** `performed_at` and `logged_at` are Postgres `date`
columns. All conversion goes through `lib/dates.ts` — using raw `new Date()` will shift
entries a day for UTC+3 users logging after midnight.

**Authorization is enforced per call, not by the proxy.** `proxy.ts` only redirects.
Every server action and page calls `requireUser()` / `requireAdmin()` from `lib/auth.ts`,
and deletes use `deleteMany({ where: { id, userId } })` so one user can never touch
another's rows.

**Registration is closed** (`plan.md` §13). No public sign-up. First admin comes from
`ADMIN_EMAIL`/`ADMIN_PASSWORD`; later accounts are created at `/admin/users`.
`deleteUser` refuses to remove the last remaining admin.

## Docker layout

Three build stages in one `Dockerfile`: `deps` → `builder` → `runner` (Next standalone).
The runner is deliberately slim and **cannot run the Prisma CLI** — its dependency tree
isn't there. So:

- migrations run in a separate `migrate` compose service (built from the `builder` stage)
  that runs to completion; `app` waits on `service_completed_successfully`.
- seeds run in the `tools` service (also `builder`, profile-gated).

If you move migrations back into the app entrypoint, it will fail with
`Cannot find module 'effect'`.

`docker compose` interpolates every service even when starting one, so `APP_DOMAIN` and
`AUTH_SECRET` must exist in `.env` even for a db-only local run.

## Design system

Tokens are in the `@theme` block of `app/globals.css`; helpers in `lib/design.ts`.

| Token | Value |
|---|---|
| `bg` / `surface` / `surface-2` | `#17181B` / `#212226` / `#292A2F` |
| `ink` / `muted` | `#F5F4F0` / `#8B8D93` |
| `plate-red` / `-blue` / `-yellow` / `-green` | `#E8412C` / `#2F6FED` / `#E8B72C` / `#3CAA5C` |

Fonts (self-hosted via `next/font`): **Bebas Neue** headings and big numerals, **Inter**
body, **JetBrains Mono** dates and numeric data.

The signature element is the circular **plate badge**, colored by weight via `plateColor()`
(≥120kg red, ≥80 blue, ≥50 yellow, ≥25 green, else grey). The nutrition tab reuses the
same disc as a calorie ring via `ringColor()` (>103% of goal red, ≥85% green, else blue).
Motion to preserve: staggered card entrance, counting numbers (`CountUp`), bottom sheets
for new entries, PR celebration badge.

## Language

UI is Turkish. Numbers use a comma decimal separator — always render through `formatNum()`.
Postgres enums are ASCII (`kahvalti`, `ogle`, `aksam`, `atistirmalik`); display labels come
from `MEAL_LABELS` in `lib/meals.ts`. Keep that split when adding enums.
