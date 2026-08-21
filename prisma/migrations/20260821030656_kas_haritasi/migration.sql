-- Kas haritası: egzersizler çoklu kanonik kas slug'ı taşır, katalog kaynağı
-- ayrılır, rutinlere haftanın günleri eklenir.
--
-- SIRA ÖNEMLİ: external_id önce eklenip wger_id'den doldurulur, sonra wger_id
-- düşer. Aksi halde mevcut 852 satırın external_id'si NULL kalır ve
-- (source, external_id) üzerinden upsert yapan seed katalogu ikizler.

-- CreateEnum
CREATE TYPE "ExerciseSource" AS ENUM ('wger', 'fedb');

-- AlterTable: yeni sütunlar (eski sütunlar henüz duruyor)
ALTER TABLE "exercises" ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "kind" TEXT,
ADD COLUMN     "primary_muscles" TEXT[],
ADD COLUMN     "source" "ExerciseSource" NOT NULL DEFAULT 'wger';

-- Veriyi taşı: upsert anahtarı wger_id'den (source, external_id) çiftine geçiyor
UPDATE "exercises" SET "external_id" = "wger_id"::text WHERE "wger_id" IS NOT NULL;

-- Eski sütunlar ve indeksleri
DROP INDEX "exercises_primary_muscle_idx";
DROP INDEX "exercises_wger_id_key";
ALTER TABLE "exercises" DROP COLUMN "primary_muscle",
DROP COLUMN "wger_id";

-- AlterTable
ALTER TABLE "routines" ADD COLUMN     "weekdays" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- CreateIndex
CREATE INDEX "exercises_category_idx" ON "exercises"("category");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_source_external_id_key" ON "exercises"("source", "external_id");
