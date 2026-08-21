import type { MuscleKey } from "../lib/muscles";

// free-exercise-db omuzu tek kova ("shoulders") tutuyor ve obliques'i hiç
// tutmuyor. Bu üç bölgeyi hareket adından çıkarıyoruz. Kurallar YALNIZCA
// seed sırasında ve yalnızca ilgili kovada çalışır.
//
// Sıra önemlidir: "Dumbbell Lying Rear Lateral Raise" hem arka omuz hem yan
// omuz kalıbına uyuyor — arka omuz önce denenmeli.
const RULES: Array<{ from: MuscleKey; to: MuscleKey; pattern: RegExp }> = [
  {
    from: "on_omuz",
    to: "arka_omuz",
    pattern: /\b(rear delt|rear lateral|reverse fly|reverse machine fly|face pull|bent[- ]over lateral)\b/i,
  },
  {
    from: "on_omuz",
    to: "yan_omuz",
    pattern: /\b(lateral raise|side lateral|side raise|upright row|lateral machine)\b/i,
  },
  {
    from: "karin",
    to: "yan_karin",
    pattern: /\b(oblique|side bend|russian twist|wood ?chop|windmill|side crunch|side plank|twisting)\b/i,
  },
];

/** Hareket adına bakarak kaba kovayı daraltır; eşleşme yoksa girdiyi döndürür. */
export function refineMuscle(key: MuscleKey, exerciseName: string): MuscleKey {
  for (const rule of RULES) {
    if (rule.from === key && rule.pattern.test(exerciseName)) return rule.to;
  }
  return key;
}
