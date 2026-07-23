// Tasarım sistemi yardımcıları — fitness-app-demo.jsx'ten birebir taşındı (plan.md §12).
// Bu dosya client component'lerden de import edildiği için sunucuya özel hiçbir şey içermez.

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

export const COLORS = {
  bg: "#17181B",
  surface: "#212226",
  surface2: "#292A2F",
  text: "#F5F4F0",
  textMuted: "#8B8D93",
  red: "#E8412C",
  blue: "#2F6FED",
  yellow: "#E8B72C",
  green: "#3CAA5C",
} as const;
