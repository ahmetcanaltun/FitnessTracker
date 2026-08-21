// Kanonik kas sözlüğü. Veritabanında Türkçe etiket değil bu slug'lar saklanır:
// etiket değişince harita sessizce boşalmasın.
// Tasarım: .claude/specs/2026-08-21-kas-haritasi.md §4

export const MUSCLE_KEYS = [
  "gogus", "on_omuz", "yan_omuz", "arka_omuz", "triseps", "biseps", "on_kol",
  "kanat", "orta_sirt", "trapez", "alt_sirt", "karin", "yan_karin", "kalca",
  "on_bacak", "arka_bacak", "baldir", "kapayici",
] as const;

export type MuscleKey = (typeof MUSCLE_KEYS)[number];

export function isMuscleKey(value: string): value is MuscleKey {
  return (MUSCLE_KEYS as readonly string[]).includes(value);
}

export const MUSCLE_LABELS: Record<MuscleKey, string> = {
  gogus: "Göğüs",
  on_omuz: "Ön Omuz",
  yan_omuz: "Yan Omuz",
  arka_omuz: "Arka Omuz",
  triseps: "Triseps",
  biseps: "Biseps",
  on_kol: "Ön Kol",
  kanat: "Kanat",
  orta_sirt: "Orta Sırt",
  trapez: "Trapez",
  alt_sirt: "Alt Sırt",
  karin: "Karın",
  yan_karin: "Yan Karın",
  kalca: "Kalça",
  on_bacak: "Ön Bacak",
  arka_bacak: "Arka Bacak",
  baldir: "Baldır",
  kapayici: "İç Bacak",
};

/** Hareket listesi filtre çipleri: birincil kastan türetilen vücut bölgesi. */
export const MUSCLE_CATEGORY: Record<MuscleKey, string> = {
  gogus: "Göğüs",
  on_omuz: "Omuz",
  yan_omuz: "Omuz",
  arka_omuz: "Omuz",
  triseps: "Kol",
  biseps: "Kol",
  on_kol: "Kol",
  kanat: "Sırt",
  orta_sirt: "Sırt",
  trapez: "Sırt",
  alt_sirt: "Sırt",
  karin: "Karın",
  yan_karin: "Karın",
  kalca: "Bacak",
  on_bacak: "Bacak",
  arka_bacak: "Bacak",
  baldir: "Bacak",
  kapayici: "Bacak",
};

/**
 * body-muscles (Apache-2.0) bölge id'lerinin önekleri. Bir kasın birden çok
 * bölgesi olabilir: kanat üst/orta/alt ve sol/sağ ayrı path'lerdir.
 */
export const MUSCLE_REGIONS: Record<MuscleKey, string[]> = {
  gogus: ["chest-"],
  on_omuz: ["shoulder-front"],
  yan_omuz: ["shoulder-side"],
  arka_omuz: ["deltoid-rear"],
  triseps: ["triceps-"],
  biseps: ["biceps-"],
  on_kol: ["forearm"],
  kanat: ["lats-"],
  orta_sirt: ["traps-mid", "traps-lower"],
  trapez: ["traps-upper"],
  alt_sirt: ["lower-back-", "spine"],
  karin: ["abs-"],
  yan_karin: ["obliques"],
  kalca: ["gluteus-"],
  on_bacak: ["quads-"],
  arka_bacak: ["hamstrings-"],
  baldir: ["calves-"],
  kapayici: ["adductors"],
};

/** free-exercise-db sözlüğü (17 kalem) -> kanonik slug. */
export const FEDB_MUSCLES: Record<string, MuscleKey> = {
  chest: "gogus",
  shoulders: "on_omuz",       // isim kuralları yan/arka omuza bölebilir
  triceps: "triseps",
  biceps: "biseps",
  forearms: "on_kol",
  lats: "kanat",
  "middle back": "orta_sirt",
  traps: "trapez",
  "lower back": "alt_sirt",
  abdominals: "karin",        // isim kuralları yan karına bölebilir
  glutes: "kalca",
  quadriceps: "on_bacak",
  hamstrings: "arka_bacak",
  calves: "baldir",
  adductors: "kapayici",
  abductors: "kalca",         // gluteus medius bölgesi kalçayla aynı figürde
  neck: "trapez",             // ayrı bölge yok; boyun trapezle birlikte gösterilir
};

/** Mevcut wger satırlarındaki Türkçe etiketler -> kanonik slug. */
export const WGER_MUSCLES: Record<string, MuscleKey> = {
  "Göğüs": "gogus",
  "Ön Omuz": "on_omuz",
  "Triseps": "triseps",
  "Biseps": "biseps",
  "Brakialis": "biseps",
  "Kanat (Lat)": "kanat",
  "Trapez": "trapez",
  "Karın": "karin",
  "Yan Karın": "yan_karin",
  "Serratus": "gogus",
  "Kalça": "kalca",
  "Ön Bacak": "on_bacak",
  "Arka Bacak": "arka_bacak",
  "Baldır": "baldir",
  "Solear": "baldir",
};
