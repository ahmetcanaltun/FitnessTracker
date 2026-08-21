// Antrenman geçmişi — saf fonksiyon, veritabanı bilmez.
// Ayrı bir "antrenman oturumu" kaydı yok; bir gün içindeki kayıtlar
// o günün antrenmanı sayılır (bkz. kullanılabilirlik raporu).

export type WorkoutEntryInput = {
  performedAt: string; // "2026-08-20"
  exerciseName: string;
  sets: number;
  reps: number;
  weightKg: number;
};

export type WorkoutDay = {
  date: string;
  exerciseCount: number;
  totalSets: number;
  topWeightKg: number;
  exerciseNames: string[];
};

export function groupWorkoutDays(entries: WorkoutEntryInput[]): WorkoutDay[] {
  const byDate = new Map<string, WorkoutEntryInput[]>();
  for (const entry of entries) {
    const list = byDate.get(entry.performedAt);
    if (list) list.push(entry);
    else byDate.set(entry.performedAt, [entry]);
  }

  return [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, list]) => {
      const names = [...new Set(list.map((e) => e.exerciseName))];
      return {
        date,
        exerciseCount: names.length,
        totalSets: list.reduce((sum, e) => sum + e.sets, 0),
        topWeightKg: list.reduce((max, e) => Math.max(max, e.weightKg), 0),
        exerciseNames: names,
      };
    });
}
