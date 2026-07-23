import { toISODate, todayISO } from "./dates";

/**
 * Kesintisiz antrenman serisi: bugünden (veya dünden) geriye doğru
 * ardışık gün sayısı.
 *
 * Bugün henüz antrenman yapılmadıysa seri bozulmuş sayılmaz — dünden
 * başlayarak sayılır, böylece gün içinde sayaç sıfırlanmış gibi görünmez.
 */
export function calculateStreak(dates: Date[], reference = todayISO()): number {
  if (dates.length === 0) return 0;

  const days = new Set(dates.map(toISODate));
  const cursor = new Date(`${reference}T00:00:00.000Z`);

  if (!days.has(toISODate(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(toISODate(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(toISODate(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}
