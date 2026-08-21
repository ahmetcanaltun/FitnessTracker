/**
 * free-exercise-db katalogunu Exercise tablosuna yazar.
 *
 *   npm run seed:fedb
 *
 * Veri lisansı: Unlicense (kamu malı). GÖRSELLER KULLANILMAZ — depoda
 * görsellerin lisansı belirtilmemiş, bu yüzden imageUrl boş bırakılır.
 * (source, externalId) üzerinden upsert: tekrar çalıştırmak güvenlidir.
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { FEDB_MUSCLES, MUSCLE_CATEGORY, type MuscleKey } from "../lib/muscles";
import { refineMuscle } from "./muscle-rules";

const URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

type FedbExercise = {
  id: string;
  name: string;
  category: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
};

/** fedb'nin antrenman türü -> Türkçe. Vücut bölgesi DEĞİL. */
const KIND_TR: Record<string, string> = {
  strength: "Kuvvet",
  stretching: "Esneme",
  plyometrics: "Pliometrik",
  powerlifting: "Powerlifting",
  "olympic weightlifting": "Halter",
  strongman: "Strongman",
  cardio: "Kardiyo",
};

const EQUIPMENT_TR: Record<string, string> = {
  "body only": "Vücut Ağırlığı",
  machine: "Makine",
  cable: "Kablo",
  barbell: "Halter",
  dumbbell: "Dambıl",
  kettlebells: "Kettlebell",
  bands: "Direnç Bandı",
  "medicine ball": "Sağlık Topu",
  "exercise ball": "Pilates Topu",
  "e-z curl bar": "Z-Bar",
  "foam roll": "Foam Roller",
  other: "Diğer",
};

function toSlugs(names: string[], exerciseName: string): MuscleKey[] {
  const out = new Set<MuscleKey>();
  for (const raw of names) {
    const base = FEDB_MUSCLES[raw];
    if (!base) continue;
    out.add(refineMuscle(base, exerciseName));
  }
  return [...out];
}

async function main() {
  console.log("free-exercise-db indiriliyor...");
  const res = await fetch(URL, {
    headers: { Accept: "application/json", "User-Agent": "fitness-track-app/0.1 (self-hosted)" },
  });
  if (!res.ok) throw new Error(`fedb isteği başarısız (${res.status})`);
  const items = (await res.json()) as FedbExercise[];

  let written = 0;
  let noMuscle = 0;

  for (const item of items) {
    if (!item.name?.trim()) continue;

    const primary = toSlugs(item.primaryMuscles ?? [], item.name);
    const secondary = toSlugs(item.secondaryMuscles ?? [], item.name).filter(
      (m) => !primary.includes(m),
    );
    if (primary.length === 0) noMuscle++;

    const data = {
      name: item.name.trim(),
      nameEn: item.name.trim(),
      // Vücut bölgesi birincil kastan türetilir — filtre çipleri bunu kullanır
      category: primary[0] ? MUSCLE_CATEGORY[primary[0]] : null,
      kind: item.category ? (KIND_TR[item.category] ?? item.category) : null,
      primaryMuscles: primary,
      secondaryMuscles: secondary,
      equipment: item.equipment ? (EQUIPMENT_TR[item.equipment] ?? item.equipment) : null,
      imageUrl: null,
    };

    await prisma.exercise.upsert({
      where: { source_externalId: { source: "fedb" as const, externalId: item.id } },
      create: { ...data, source: "fedb" as const, externalId: item.id },
      update: data,
    });
    written++;
  }

  console.log(`${written} hareket yazıldı, ${noMuscle} tanesinin kas verisi yok.`);
  if (written === 0) throw new Error("Hiç kayıt yazılmadı — seed başarısız sayılır.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
