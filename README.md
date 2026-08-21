# Fitness Track

Self-hosted workout and nutrition tracker. Deploy your own instance — admin
invites users, no public sign-up. Turkish UI.

Next.js 16 · Prisma 7 · PostgreSQL 16 · Auth.js v5 · Tailwind v4

## What it does

- **Workouts** — search a catalog of ~850 exercises, log weight, sets and reps,
  see a progress chart per exercise and personal-record highlighting.
- **Routines** — build a workout program, order the movements, and jump straight
  into logging with the targets prefilled.
- **Nutrition** — log food per meal, track calories and macros against a goal,
  count water, and review daily or weekly history.
- **Installable** — add to home screen and run standalone (PWA).

Accounts are created by an admin; there is no public sign-up.

## Getting started

Requires Node 20.9+ and Docker.

```bash
cp .env.example .env          # fill in the values (AUTH_SECRET: openssl rand -base64 32)

docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
npm install
npx prisma generate           # Prisma Client is gitignored, generate it first
npm run db:migrate

npm run seed:exercises        # ~850 exercises from wger
npm run seed:foods            # 77 staple foods
npm run seed:admin            # first admin account, from ADMIN_* in .env

npm run dev                   # http://localhost:3000
```

All three seed scripts are idempotent — rerunning them updates rather than
duplicates.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint / tsc |
| `npm run db:migrate` / `db:deploy` / `db:studio` | Prisma |
| `npm run seed:exercises` / `seed:foods` / `seed:admin` | Load data |
| `npm run icons` | Regenerate PWA icons |

## Notes

**External APIs are not on the request path.** Exercises are imported once by a
seed script, so the app never calls wger at runtime. Open Food Facts is the one
exception — a live search the user triggers explicitly when a packaged product
is missing from the local catalog.

**Meal entries store their own macros.** Values are multiplied out and copied
onto the row when logged, so correcting a food's reference values later never
rewrites history.

**The service worker is deliberately narrow.** It caches static assets and an
offline page, nothing else. Every page is auth-gated and shows personal data, so
navigations always hit the network and no page content is written to disk.

## Data sources

Exercises from [wger](https://wger.de) (CC-BY-SA), packaged products from
[Open Food Facts](https://openfoodfacts.org) (ODbL), staple food values
referenced from USDA FoodData Central.

## License

Code is [MIT-licensed](LICENSE). Exercise and food data keep their own
upstream licenses, noted above.

## Veri ve görsel kaynakları

- Hareket katalogu: [free-exercise-db](https://github.com/yuhonas/free-exercise-db) — Unlicense (kamu malı). Yalnızca JSON verisi kullanılıyor, görselleri kullanılmıyor.
- Kas haritası çizimi: [body-muscles](https://github.com/vulovix/body-muscles) — Apache License 2.0, © vulovix.
- Eski hareket kayıtları: [wger](https://wger.de) — CC-BY-SA.
