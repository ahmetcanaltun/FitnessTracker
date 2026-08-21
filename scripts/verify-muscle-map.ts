import { weeklyMuscleVolume, sessionMuscleVolume, muscleLevel } from "../lib/muscle-map";

let failed = 0;
function check(label: string, got: unknown, expected: unknown) {
  const a = JSON.stringify(got);
  const b = JSON.stringify(expected);
  if (a !== b) {
    failed++;
    console.error(`HATA ${label}: ${a}, beklenen ${b}`);
  }
}

// Bench 4 set (birincil göğüs, ikincil triseps) + fly 3 set (birincil göğüs)
const itis = {
  weekdays: [1, 4],
  items: [
    { targetSets: 4, primaryMuscles: ["gogus"], secondaryMuscles: ["triseps"] },
    { targetSets: 3, primaryMuscles: ["gogus"], secondaryMuscles: [] },
  ],
};

const tek = sessionMuscleVolume(itis.items);
check("tek göğüs", tek.gogus, 7);
check("tek triseps", tek.triseps, 2);

const hafta = weeklyMuscleVolume([itis]);
check("hafta göğüs", hafta.gogus, 14);
check("hafta triseps", hafta.triseps, 4);
check("hafta kanat", hafta.kanat, 0);

const varsayilan = sessionMuscleVolume([
  { targetSets: null, primaryMuscles: ["kanat"], secondaryMuscles: [] },
]);
check("varsayılan set", varsayilan.kanat, 3);

// Çoklu birincil kas bölüşülmez
const dips = sessionMuscleVolume([
  { targetSets: 3, primaryMuscles: ["gogus", "triseps"], secondaryMuscles: [] },
]);
check("dips göğüs", dips.gogus, 3);
check("dips triseps", dips.triseps, 3);

const gunsuz = weeklyMuscleVolume([{ weekdays: [], items: itis.items }]);
check("günsüz rutin", gunsuz.gogus, 0);

// Eski wger satırlarından kalan Türkçe etiketler slug değil: sessizce atlanmalı
const kirli = sessionMuscleVolume([
  { targetSets: 5, primaryMuscles: ["Göğüs"], secondaryMuscles: [] },
]);
check("slug olmayan değer", kirli.gogus, 0);

const kassiz = sessionMuscleVolume([
  { targetSets: 5, primaryMuscles: [], secondaryMuscles: [] },
]);
check("kassız hareket", kassiz.gogus, 0);

check("seviye 0", muscleLevel(0), 0);
check("seviye 1 alt", muscleLevel(1), 1);
check("seviye 1 üst", muscleLevel(9.5), 1);
check("seviye 2 alt", muscleLevel(10), 2);
check("seviye 2 üst", muscleLevel(19.9), 2);
check("seviye 3", muscleLevel(20), 3);

console.log(failed === 0 ? "tüm kontroller geçti" : `${failed} kontrol başarısız`);
process.exit(failed === 0 ? 0 : 1);
