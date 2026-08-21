// Tasarım sistemi yardımcıları — fitness-app-demo.jsx'ten birebir taşındı (plan.md §12).
// Bu dosya client component'lerden de import edildiği için sunucuya özel hiçbir şey içermez.

/**
 * Türkçe kurallarına göre büyük harf.
 *
 * Düz `toUpperCase()` "i" harfini "I" yapar; Türkçe'de "İ" olmalı
 * ("İtiş Günü" -> "İTIŞ GÜNÜ" yerine "İTİŞ GÜNÜ"). Başlıklar büyük harfle
 * gösterildiği için bu fark her ekranda görünür.
 */
export function upper(value: string): string {
  return value.toLocaleUpperCase("tr");
}

/**
 * Katalog hareket adları için büyük harf.
 *
 * Katalog (free-exercise-db) İngilizce; `upper()` Türkçe kuralıyla
 * "Arm Circles"ı "ARM CİRCLES" yapar. UI metinleri upper() ile kalır,
 * hareket adları bu fonksiyondan geçer. (Eski wger satırlarının Türkçe
 * adlarında "i" → "I" olabilir — İngilizce katalogda her adın bozulmasına
 * tercih edildi.)
 */
export function upperName(value: string): string {
  return value.toLocaleUpperCase("en");
}

/** Ondalık ayırıcı virgül, gereksiz sıfır yok: 92.5 -> "92,5", 100.0 -> "100" */
export function formatNum(n: number): string {
  const r = Math.round(n * 10) / 10;
  return (Number.isInteger(r) ? String(r) : r.toFixed(1)).replace(".", ",");
}

export type PlateColor = { bg: string; text: string; label: string };

/** Ağırlığa en yakın yarışma diskinin rengi — imza görsel öğe */
export function plateColor(kg: number): PlateColor {
  if (kg >= 120) return { bg: "#E8412C", text: "#FFFFFF", label: "25 KG DİSK" };
  if (kg >= 80) return { bg: "#2F6FED", text: "#FFFFFF", label: "20 KG DİSK" };
  if (kg >= 50) return { bg: "#E8B72C", text: "#1A1B1E", label: "15 KG DİSK" };
  if (kg >= 25) return { bg: "#3CAA5C", text: "#FFFFFF", label: "10 KG DİSK" };
  return { bg: "#C7C9CE", text: "#1A1B1E", label: "5 KG DİSK" };
}

/** Kalori halkası: hedefin %103'ünü aşınca kırmızı, %85+ yeşil, altı mavi */
export function ringColor(pct: number): string {
  if (pct > 1.03) return "#E8412C";
  if (pct >= 0.85) return "#3CAA5C";
  return "#2F6FED";
}


/** Kas haritası: haftalık set eşdeğerine göre bölge rengi */
export function muscleColor(sets: number): string {
  if (sets >= 20) return "#E8412C";
  if (sets >= 10) return "#3CAA5C";
  if (sets > 0) return "#2F6FED";
  return "#3A3B40";
}
