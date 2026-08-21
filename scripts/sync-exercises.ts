/**
 * wger REST API'sinden egzersizleri çekip `Exercise` tablosuna yazar.
 *
 * NOT: Ana katalog artık free-exercise-db (`npm run seed:fedb`). Bu script
 * yalnızca geçmiş kayıtları olan eski wger satırlarını güncel tutmak ve
 * kaslarını kanonik slug'a taşımak için duruyor; yeni hareket aramaları
 * fedb üzerinden yapılır. (source, externalId) ile upsert eder.
 *
 *   npm run seed:exercises
 *
 * Veri lisansı: wger içeriği CC-BY-SA (plan.md §13).
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";
import {
  CATEGORY_TR,
  EQUIPMENT_TR,
  MUSCLE_TR,
  WGER_LANG_EN,
  WGER_LANG_TR,
  translate,
} from "./wger-dictionary";
import { WGER_MUSCLES, MUSCLE_CATEGORY, type MuscleKey } from "../lib/muscles";

const API = "https://wger.de/api/v2/exerciseinfo/";
const PAGE_SIZE = 100;

type WgerTranslation = { name: string; language: number };
type WgerNamed = { name: string; name_en?: string };
type WgerImage = { image: string; is_main?: boolean };

type WgerExercise = {
  id: number;
  category: WgerNamed | null;
  muscles: WgerNamed[];
  muscles_secondary: WgerNamed[];
  equipment: WgerNamed[];
  images: WgerImage[];
  translations: WgerTranslation[];
};

type WgerPage = { count: number; next: string | null; results: WgerExercise[] };

async function fetchPage(url: string): Promise<WgerPage> {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "fitness-track-app/0.1 (self-hosted)" },
  });
  if (!res.ok) {
    throw new Error(`wger isteği başarısız (${res.status}): ${url}`);
  }
  return res.json() as Promise<WgerPage>;
}

/** Türkçe çeviri varsa onu, yoksa İngilizce adı kullan. */
function pickNames(translations: WgerTranslation[]) {
  const tr = translations.find((t) => t.language === WGER_LANG_TR && t.name?.trim());
  const en = translations.find((t) => t.language === WGER_LANG_EN && t.name?.trim());
  const name = (tr?.name ?? en?.name ?? "").trim();
  return { name, nameEn: en?.name?.trim() ?? null };
}

function pickImage(images: WgerImage[]): string | null {
  if (images.length === 0) return null;
  return (images.find((i) => i.is_main) ?? images[0]).image ?? null;
}

/** wger'in latince kas adlarını kanonik slug'a indirger. */
function wgerSlugs(names: Array<{ name: string }> | undefined): MuscleKey[] {
  const out = new Set<MuscleKey>();
  for (const m of names ?? []) {
    const tr = translate(MUSCLE_TR, m.name);
    const slug = tr ? WGER_MUSCLES[tr] : undefined;
    if (slug) out.add(slug);
  }
  return [...out];
}

async function main() {
  let url = `${API}?format=json&limit=${PAGE_SIZE}`;
  let seen = 0;
  let written = 0;
  let skipped = 0;

  console.log("wger egzersizleri çekiliyor...");

  while (url) {
    const page: WgerPage = await fetchPage(url);

    for (const item of page.results) {
      seen++;
      const { name, nameEn } = pickNames(item.translations ?? []);

      // İsmi olmayan kayıtlar (bazı taslak egzersizler) atlanır
      if (!name) {
        skipped++;
        continue;
      }

      // Artık TÜM birincil kaslar saklanıyor: wger egzersizlerinin %26'sında
      // birden fazla var (Dips -> göğüs + triseps).
      const primary = wgerSlugs(item.muscles);
      const secondary = wgerSlugs(item.muscles_secondary).filter((m) => !primary.includes(m));

      const data = {
        name,
        nameEn,
        category: primary[0]
          ? MUSCLE_CATEGORY[primary[0]]
          : translate(CATEGORY_TR, item.category?.name),
        kind: "Kuvvet",
        primaryMuscles: primary,
        secondaryMuscles: secondary,
        equipment: translate(EQUIPMENT_TR, item.equipment?.[0]?.name),
        imageUrl: pickImage(item.images ?? []),
      };

      await prisma.exercise.upsert({
        where: { source_externalId: { source: "wger" as const, externalId: String(item.id) } },
        create: { ...data, source: "wger" as const, externalId: String(item.id) },
        update: data,
      });
      written++;
    }

    console.log(`  ${seen}/${page.count} işlendi`);
    url = page.next ?? "";
  }

  console.log(`Bitti: ${written} egzersiz yazıldı, ${skipped} isimsiz kayıt atlandı.`);
}

main()
  .catch((error) => {
    console.error("sync-exercises hatası:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
