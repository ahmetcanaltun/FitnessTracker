import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MUSCLE_KEYS, MUSCLE_LABELS } from "@/lib/muscles";
import type { MuscleVolume } from "@/lib/muscle-map";
import { upper } from "@/lib/design";

/**
 * Rutin ekranlarında tam harita yerine tek satır: en ihmal edilen kaslar.
 * Tam harita İlerleme sekmesinde.
 */
export function MuscleSummary({ volume }: { volume: MuscleVolume }) {
  const idle = MUSCLE_KEYS.filter((key) => volume[key] === 0);
  const weakest = MUSCLE_KEYS.filter((key) => volume[key] > 0)
    .sort((a, b) => volume[a] - volume[b])
    .slice(0, 2);

  const names = (idle.length > 0 ? idle : weakest).slice(0, 3).map((k) => MUSCLE_LABELS[k]);

  return (
    <Link href="/progress" className="fit-card flex items-center gap-3 p-4">
      <div className="flex-1 min-w-0">
        <p className="field-label" style={{ marginBottom: "2px" }}>
          {upper(idle.length > 0 ? "Hiç çalışmayan" : "En az çalışan")}
        </p>
        <p className="truncate" style={{ fontSize: "14px" }}>
          {names.length > 0 ? names.join(" · ") : "Tüm kaslar çalışıyor"}
        </p>
      </div>
      <ChevronRight size={18} style={{ color: "var(--color-muted)" }} />
    </Link>
  );
}
