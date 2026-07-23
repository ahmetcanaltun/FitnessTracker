import { formatNum, plateColor } from "@/lib/design";

/**
 * İmza öğe: ağırlığa göre renklenen yarışma diski rozeti.
 * `size="lg"` egzersiz detayı ve beslenme halkasının ortasında kullanılır.
 */
export function PlateBadge({
  kg,
  size = "sm",
  className = "",
}: {
  kg: number;
  size?: "sm" | "lg";
  className?: string;
}) {
  const colors = plateColor(kg);
  const isLarge = size === "lg";

  return (
    <div
      className={`${isLarge ? "plate-badge-lg" : "plate-badge"} shrink-0 ${className}`}
      style={{ background: colors.bg, color: colors.text }}
    >
      <span className="font-display" style={{ fontSize: isLarge ? "40px" : "18px", lineHeight: 1 }}>
        {formatNum(kg)}
      </span>
      <span
        style={{
          fontSize: isLarge ? "11px" : "8px",
          fontWeight: 700,
          letterSpacing: isLarge ? "0.1em" : "0.08em",
          opacity: 0.85,
        }}
      >
        KG
      </span>
    </div>
  );
}
