# Fitness Takip

Kişisel/aile kullanımı için self-hosted egzersiz ve beslenme takip uygulaması.
Detaylı proje planı: [`plan.md`](./plan.md).

Next.js 16 · Prisma 7 · PostgreSQL 16 · Auth.js v5 · Tailwind v4 · Docker Compose

## Yerel geliştirme

```bash
cp .env.example .env          # değerleri doldur (AUTH_SECRET: openssl rand -base64 32)
docker compose up -d db       # Postgres -> localhost:5433
npm install
npx prisma generate           # Prisma Client'ı üret (gitignore'da)
npm run db:migrate            # şemayı uygula

npm run seed:exercises        # wger'den ~850 egzersiz
npm run seed:foods            # 77 çekirdek besin
npm run seed:admin            # ilk admin hesabı (.env'deki ADMIN_* değerleriyle)

npm run dev                   # http://localhost:3000
```

Üç seed script'i de idempotent — tekrar çalıştırmak kopya oluşturmaz.

## VPS'e kurulum

Ön koşul: bir domain adının VPS'in IP'sine yönlendirilmiş olması (Caddy otomatik
HTTPS için gerekli).

```bash
cp .env.example .env          # APP_DOMAIN, AUTH_SECRET, POSTGRES_PASSWORD, ADMIN_* doldur
docker compose up -d          # db + migrate + app + caddy

docker compose run --rm tools npm run seed:exercises
docker compose run --rm tools npm run seed:foods
docker compose run --rm tools npm run seed:admin
```

`migrate` servisi her açılışta `prisma migrate deploy` çalıştırıp çıkar; `app`
tamamlanmasını bekler. Postgres verisi `pgdata` volume'ünde kalıcıdır.

Yedekleme:

```bash
docker compose exec -T db pg_dump -U fitness fitness > yedek.sql
```

## Kullanım

Kayıt formu yok — hesaplar yönetici tarafından **Profil → Kullanıcı Yönetimi**
ekranından eklenir (`plan.md` §13).

Sekmeler: **Hareketler** (egzersiz ara, kg/set/tekrar kaydet, ilerleme grafiği),
**Beslenme** (öğün bazlı besin, kalori/makro halkası, su sayacı), **İlerleme**
(hareket bazlı kişisel rekorlar), **Profil** (hedefler, yönetim, çıkış).

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint / tsc |
| `npm run db:migrate` / `db:deploy` / `db:studio` | Prisma |
| `npm run seed:exercises` / `seed:foods` / `seed:admin` | Veri yükleme |

## Veri kaynakları

Egzersizler [wger](https://wger.de) (CC-BY-SA), besin değerleri USDA FoodData
Central referanslı. Uygulama herkese açılırsa atıf satırı eklenmeli (`plan.md` §13).
