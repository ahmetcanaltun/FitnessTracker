# Fitness Takip Uygulaması — Proje Planı

## 1. Genel Bakış

Kişisel/aile kullanımı için, hangi egzersizde kaç kg'da olunduğunu zaman içinde takip eden,
mobil uyumlu bir web uygulaması. Kullanıcı girişi olacak, egzersiz listesi hazır bir
veritabanından (wger) çekilip kendi sistemimize aktarılacak, kullanıcı tek tek egzersiz
eklemeyecek. Kendi VPS'inde Docker ile self-hosted çalışacak.

Ek olarak **beslenme takibi** de eklenecek: öğün bazlı besin kaydı, günlük kalori/makro
(protein-karbonhidrat-yağ) hedefi ve gerçekleşen takibi. Egzersizlerde olduğu gibi besinler
de kullanıcı tarafından tek tek elle girilmeyecek, hazır bir besin veritabanından aranıp
seçilecek.

## 2. Teknoloji Yığını

| Katman | Seçim | Neden |
|---|---|---|
| Frontend + Backend | **Next.js 14+ (App Router)** | Tek proje içinde hem UI hem API routes/Server Actions, mobil uyumlu SSR |
| Stil | Tailwind CSS | Hızlı, mobil-first tasarım |
| Veritabanı | **PostgreSQL** (Docker container) | İlişkisel veri (kullanıcı, egzersiz, kayıtlar) için ideal |
| ORM | Prisma | Tip güvenli, migration yönetimi kolay |
| Auth | Auth.js (NextAuth) — Credentials provider | Self-hosted, email+şifre, session/JWT tabanlı |
| Grafik | Recharts | Egzersiz bazlı kg-zaman ilerleme grafiği |
| Reverse Proxy / HTTPS | Caddy | Otomatik SSL, nginx'e göre daha az config |
| Container | Docker Compose | app + db + proxy tek `docker-compose up` ile ayağa kalkar |
| PWA | next-pwa | Mobilde "ana ekrana ekle", app benzeri deneyim (native app'e gerek kalmadan) |

## 3. Sistem Mimarisi

```
[Kullanıcı - Mobil Tarayıcı]
        |
   [Caddy - HTTPS/Reverse Proxy]
        |
   [Next.js App Container]
        |  Prisma
   [PostgreSQL Container]
```

Tüm servisler tek VPS üzerinde Docker Compose ile çalışır. wger API'sine sadece
**seed/sync script** çalıştırılırken bir kez bağlanılır — uygulama çalışırken dış API'ye
bağımlılık olmaz (hız + offline-dayanıklılık için önemli).

## 4. Veritabanı Şeması (özet)

```
User
 - id, name, email, password_hash, role (member/admin), created_at

Exercise
 - id, name, name_en, category, primary_muscle,
   secondary_muscles[], equipment, image_url,
   wger_id (kaynak referansı), created_at

ExerciseEntry   (asıl takip tablosu)
 - id, user_id -> User, exercise_id -> Exercise
 - weight_kg, reps, sets, performed_at (tarih)
 - notes (opsiyonel, "zor geldi" gibi)
 - created_at

FoodItem
 - id, name, name_en, brand (opsiyonel), unit (100g/adet/dilim vb.)
 - kcal_per_unit, protein_g, carbs_g, fat_g
 - source (openfoodfacts/usda/manual), external_id (barcode/fdc_id), created_at

MealEntry   (beslenme takip tablosu)
 - id, user_id -> User, food_item_id -> FoodItem
 - meal_type (kahvaltı/öğle/akşam/atıştırmalık), quantity
 - kcal, protein_g, carbs_g, fat_g   (kayıt anındaki hesaplanmış değerler)
 - logged_at (tarih), created_at

NutritionGoal
 - id, user_id -> User
 - kcal_goal, protein_goal, carbs_goal, fat_goal, water_goal_glasses
 - updated_at

WaterEntry   (basit sayaç, tek buton ile artırılır)
 - id, user_id -> User, date, glass_count
 - updated_at
```

`ExerciseEntry` tablosu ana veri: bir kullanıcı bir egzersizi hangi tarihte kaç kg,
kaç tekrar/set yaptığını burada tutar. İlerleme grafiği bu tablodan çekilir.
`MealEntry` aynı mantıkla, bir kullanıcının hangi öğünde ne yediğini ve o anki
kalori/makro değerlerini tutar (ürünün besin değeri ileride değişse bile geçmiş kayıt
sabit kalsın diye hesaplanmış değerler satıra kopyalanır).

## 5. Egzersiz Veritabanı Stratejisi

- Kaynak: **wger REST API** — `https://wger.de/api/v2/exercise/` — public endpoint,
  API key gerektirmiyor, ücretsiz.
- Tek seferlik bir **seed script** (`scripts/sync-exercises.ts`) yazılacak:
  1. wger API'den tüm egzersizleri (isim, kas grubu, ekipman, görsel) çeker
  2. Kendi `Exercise` tablomuza yazar
  3. İstenirse periyodik olarak (örn. ayda bir) yeniden çalıştırılıp güncellenebilir
- Kullanıcı arayüzde bu hazır listeden **arayarak/filtreleyerek seçer**, manuel eklemeye
  gerek kalmaz. İstenirse ileride "kendi egzersizimi ekle" özelliği ayrı bir opsiyonel
  faz olarak eklenebilir.
- Not: wger verisi çoğunlukla İngilizce/Almanca; gerekirse egzersiz isimlerini
  Türkçeleştiren küçük bir çeviri katmanı (statik sözlük) eklenebilir.

## 6. Besin Veritabanı Stratejisi

- Kaynak: **Open Food Facts API** — `https://world.openfoodfacts.org/api/v2/` — public,
  API key gerektirmiyor, ücretsiz, ödünç/paylaşımlı açık lisans (ODbL). 3M+ ürün,
  barkod ile arama dahil; markalı/paketli ürünlerde (Türkiye dahil) güçlü.
- Genel/çiğ besinler (tavuk göğsü, pirinç, yumurta gibi paketsiz ürünler) için Open Food
  Facts bazen eksik kalabiliyor; bu yüzden temel besinler için küçük, elle hazırlanmış
  bir **çekirdek besin listesi** (referans: USDA FoodData Central) `FoodItem` tablosuna
  ayrıca seed edilecek — yaklaşık 50-100 temel besin yeterli olur.
- Kullanıcı önce bu birleşik yerel listede arar; bulamazsa (opsiyonel Faz 2 özelliği)
  Open Food Facts'ta canlı arama yapılıp seçilen ürün `FoodItem` tablosuna eklenir.
- Barkod ile hızlı ekleme (telefon kamerası) ileride opsiyonel bir gelişmiş özellik
  olarak değerlendirilebilir.

## 7. Kimlik Doğrulama

- Auth.js (NextAuth) + Credentials provider: email + şifre (bcrypt ile hash'lenir)
- Aile/arkadaş kullanımı olduğu için basit roller: `member` / `admin`
  (admin: kullanıcı ekleyip çıkarabilir, gerekirse)
- Her kullanıcı sadece kendi `ExerciseEntry` kayıtlarını görür (opsiyonel: ileride
  "aile üyemin ilerlemesini gör" gibi bir paylaşım ayarı eklenebilir)

## 8. Docker & VPS Deployment

```
docker-compose.yml
 ├─ app       (Next.js, production build, standalone output)
 ├─ db        (postgres:16, volume ile kalıcı veri)
 └─ caddy     (reverse proxy + otomatik HTTPS, domain gerekli)
```

- `.env` içinde: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Prisma migration'lar container başlarken otomatik çalıştırılır (`prisma migrate deploy`)
- Postgres verisi Docker volume ile kalıcı hale getirilir (yedekleme için `pg_dump` cron)

## 9. Özellik Fazları

**Faz 1 — MVP**
- Kayıt / giriş
- wger'den seed edilmiş egzersiz listesi, arama/filtre (kas grubu, ekipman)
- Egzersiz seçip kg + tekrar + set + tarih girme
- Geçmiş kayıtları liste halinde görme (egzersize göre filtreli)
- Beslenme: çekirdek besin listesinden öğün bazlı (kahvaltı/öğle/akşam/atıştırmalık)
  besin ekleme, günlük kalori/makro toplamı ve hedefe göre ilerleme gösterimi
- Su takibi: tek butonla bardak sayısı artırma, günlük hedefe göre basit gösterim

**Faz 2 — İlerleme Takibi**
- Egzersiz bazlı kg/zaman grafiği (Recharts)
- Kişisel rekor (PR) vurgusu
- Favori egzersizler / hızlı erişim
- Beslenme geçmişi: günlük/haftalık kalori-makro grafiği

**Faz 3 — Mobil Deneyim**
- PWA desteği (ana ekrana ekle, offline cache)
- Egzersiz görselleri/GIF gösterimi
- Open Food Facts üzerinden canlı besin arama + barkod ile ekleme

**Faz 4 — Opsiyonel**
- Antrenman programı/rutin oluşturma
- Aile üyeleri arası ilerleme paylaşımı (gizlilik ayarlı)

## 10. Önerilen Klasör Yapısı

```
/app
  /(auth)/login, /register
  /(dashboard)/exercises, /nutrition, /history, /progress
  /api/... (gerekirse route handler'lar)
/prisma/schema.prisma
/scripts/sync-exercises.ts
/scripts/seed-food-items.ts
/components
/lib (auth, prisma client, wger client, open-food-facts client)
docker-compose.yml
Dockerfile
Caddyfile
```

## 11. Sonraki Adım

Bu plan onaylanırsa bir sonraki adım: Next.js + Prisma iskeletini kurmak, Postgres
şemasını oluşturmak ve wger sync script'ini yazmak (Faz 1'in ilk teknik adımları).

## 12. Tasarım Sistemi

Görsel referans: `fitness-app-demo.jsx` (bu sohbette paylaşılan interaktif prototip).
Next.js uygulaması kodlanırken bu dosya birebir referans alınmalı — renkler, fontlar
ve bileşen davranışları buradan aynen taşınmalı.

- **Palet:** Koyu grafit zemin (`#17181B`), kart yüzeyi (`#212226`); yarışma diski
  renk kodlaması (kırmızı `#E8412C` / mavi `#2F6FED` / sarı `#E8B72C` / yeşil `#3CAA5C`)
  hem ağırlık rozetlerinde hem kalori/makro göstergelerinde kullanılıyor.
- **Tipografi:** Başlıklar ve büyük rakamlar → Bebas Neue (skorbord hissi), gövde metni
  → Inter, tarih/sayısal veri → JetBrains Mono.
- **İmza öğe:** Dairesel "disk" rozetler — egzersiz kartlarında ağırlık dolgu rengiyle,
  beslenme sekmesinde kalori ilerleme halkasıyla tekrar kullanılıyor.
- **Hareket:** Kartlar sırayla beliriyor, ağırlık/kalori sayıları sayarak artıyor, yeni
  kayıt eklerken alttan panel açılıyor, PR kırılınca kısa kutlama animasyonu oynuyor.
- **Not:** Artifact ortamında Tailwind derleyicisi kısıtlı olduğu için renkler CSS
  değişkeni + inline stil ile verildi. Gerçek projede bunlar `tailwind.config.js`
  içinde tema (`theme.extend.colors`, `fontFamily`) olarak tanımlanırsa kod çok
  daha temiz olur — Claude Code'a bunu da belirtmekte fayda var.

## 13. Açık Noktalar / Varsayımlar

Bu kararlar planda netleşmemişti, aşağıdaki varsayımlarla ilerliyoruz (değiştirmek
istersen söylemen yeterli):

- **Kayıt kapalı olacak.** Herkese açık "kayıt ol" formu olmayacak; hesaplar admin
  tarafından eklenir (basit bir "kullanıcı ekle" ekranı, Faz 1 kapsamında).
- **Domain gerekiyor.** Caddy'nin otomatik HTTPS alabilmesi için bir domain adının
  VPS'in IP'sine yönlendirilmiş olması lazım (örn. `fitness.senindomainin.com`).
  Bu proje başlamadan önceki tek dış bağımlılık.
- **İlk admin hesabı** `.env` içindeki `ADMIN_EMAIL` / `ADMIN_PASSWORD` ile ilk
  deploy'da otomatik oluşturulur; sonraki kullanıcılar admin panelinden eklenir.
- **Veri lisansı notu:** wger verisi CC-BY-SA, Open Food Facts verisi ODbL lisanslı.
  Kişisel/aile kullanımı için risk yok, ama uygulama ileride herkese açılırsa
  "veri kaynağı: wger.de, Open Food Facts" şeklinde bir atıf satırı eklenmeli.


