import { toISODate } from "./dates";

export type DayTotals = {
  date: string; // "2026-07-23"
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Bucket = {
  /** Grafik ekseninde görünen kısa etiket */
  label: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Haftalık görünümde ortalamanın kaç güne bölündüğü — günlükte 1 */
  days: number;
};

const SHORT_MONTHS = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

function labelFor(iso: string): string {
  const d = new Date(`${iso}T00:00:00.000Z`);
  return `${d.getUTCDate()} ${SHORT_MONTHS[d.getUTCMonth()]}`;
}

/**
 * Kayıt olmayan günleri sıfırla doldurur.
 *
 * Bu önemli: yalnızca kayıtlı günleri çizmek, iki hafta hiç giriş yapılmamış
 * bir aralığı grafikte yan yana iki gün gibi gösterir ve trendi yanıltır.
 */
export function toDailyBuckets(totals: DayTotals[], days: number, today: Date): Bucket[] {
  const byDate = new Map(totals.map((t) => [t.date, t]));
  const buckets: Bucket[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const iso = toISODate(d);
    const found = byDate.get(iso);
    buckets.push({
      label: labelFor(iso),
      kcal: found?.kcal ?? 0,
      protein: found?.protein ?? 0,
      carbs: found?.carbs ?? 0,
      fat: found?.fat ?? 0,
      days: 1,
    });
  }

  return buckets;
}

/**
 * Haftalık görünüm: her hafta için *günlük ortalama* verir, toplam değil.
 * Ortalama, hedef çizgisiyle aynı ölçekte kaldığı için karşılaştırılabilir;
 * haftalık toplam gösterilseydi hedef çizgisi anlamsız olurdu.
 */
export function toWeeklyBuckets(totals: DayTotals[], weeks: number, today: Date): Bucket[] {
  const byDate = new Map(totals.map((t) => [t.date, t]));
  const buckets: Bucket[] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const end = new Date(today);
    end.setUTCDate(end.getUTCDate() - w * 7);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 6);

    let kcal = 0, protein = 0, carbs = 0, fat = 0;
    // Kayıt olmayan günler de bölene dahil: 7 günün 2'sinde yenmişse
    // ortalama 7'ye bölünür, aksi halde eksik takip yüksek ortalama gibi görünür.
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      const found = byDate.get(toISODate(d));
      if (found) {
        kcal += found.kcal;
        protein += found.protein;
        carbs += found.carbs;
        fat += found.fat;
      }
    }

    buckets.push({
      label: `${start.getUTCDate()} ${SHORT_MONTHS[start.getUTCMonth()]}`,
      kcal: Math.round(kcal / 7),
      protein: Math.round((protein / 7) * 10) / 10,
      carbs: Math.round((carbs / 7) * 10) / 10,
      fat: Math.round((fat / 7) * 10) / 10,
      days: 7,
    });
  }

  return buckets;
}

/** Hedefe uyum: kayıt girilen günlerin ortalaması ve hedefe yakınlığı */
export function summarize(buckets: Bucket[], kcalGoal: number) {
  const active = buckets.filter((b) => b.kcal > 0);
  if (active.length === 0) {
    return { avgKcal: 0, avgProtein: 0, activeDays: 0, onTargetDays: 0 };
  }

  const avgKcal = Math.round(active.reduce((s, b) => s + b.kcal, 0) / active.length);
  const avgProtein =
    Math.round((active.reduce((s, b) => s + b.protein, 0) / active.length) * 10) / 10;

  // Hedefin %90-105 aralığı "tutturuldu" sayılır
  const onTargetDays = active.filter(
    (b) => b.kcal >= kcalGoal * 0.9 && b.kcal <= kcalGoal * 1.05,
  ).length;

  return { avgKcal, avgProtein, activeDays: active.length, onTargetDays };
}
