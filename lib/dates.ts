// Tarih yardımcıları.
//
// `performed_at` ve `logged_at` Postgres'te `date` tipinde (saat bilgisi yok).
// Saat dilimi kaymalarını önlemek için tüm gün değerlerini UTC gece yarısına
// sabitliyoruz — aksi halde TR (UTC+3) saatinde 00:00-03:00 arası girilen kayıt
// bir önceki güne düşer.

/** "2026-07-23" -> UTC gece yarısı Date */
export function dateFromISO(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

/** Date -> "2026-07-23" */
export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Kullanıcının yerel takvimine göre bugünün ISO tarihi */
export function todayISO(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}


/** "Bugün", "Dün", "3 gün önce", "2 hafta önce", "5 ay önce" */
export function relativeDayLabel(d: Date, reference = new Date()): string {
  const days = Math.round(
    (dateFromISO(toISODate(reference)).getTime() - dateFromISO(toISODate(d)).getTime()) / 86_400_000,
  );

  if (days <= 0) return "Bugün";
  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} hafta önce`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ay önce`;
  }
  return `${Math.floor(days / 365)} yıl önce`;
}

const SHORT_MONTHS = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

/** Grafik ekseni için kısa etiket: "12 Tem" */
export function shortDateLabel(d: Date): string {
  return `${d.getUTCDate()} ${SHORT_MONTHS[d.getUTCMonth()]}`;
}

/**
 * Bugünün hafta günü: 1=Pazartesi … 7=Pazar.
 * Routine.weekdays bu numaralandırmayı kullanıyor; JS'in 0=Pazar'ı değil.
 */
export function todayWeekday(): number {
  const day = dateFromISO(todayISO()).getUTCDay();
  return day === 0 ? 7 : day;
}

/** Profil ekranı: "Şubat 2026" */
export function monthYearLabel(d: Date): string {
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}
