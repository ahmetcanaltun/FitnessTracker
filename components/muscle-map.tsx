import {
  MUSCLE_KEYS,
  MUSCLE_LABELS,
  MUSCLE_REGIONS,
  type MuscleKey,
} from "@/lib/muscles";
import { MUSCLE_SHAPES, SHAPE_VIEWBOX } from "@/lib/muscle-shapes";
import type { MuscleVolume } from "@/lib/muscle-map";
import { formatNum, muscleColor, upper } from "@/lib/design";

// Bölge id'sinden kanonik kasa: önekler MUSCLE_REGIONS'ta tanımlı.
// Kafa, el, diz gibi bölgeler hiçbir kasa düşmez ve nötr kalır.
function keyForShape(id: string): MuscleKey | null {
  for (const key of MUSCLE_KEYS) {
    if (MUSCLE_REGIONS[key].some((prefix) => id.startsWith(prefix))) return key;
  }
  return null;
}

const LEGEND = [
  { color: "#2F6FED", text: "1-9 az" },
  { color: "#3CAA5C", text: "10-19 yeterli" },
  { color: "#E8412C", text: "20+ yüksek" },
  { color: "#3A3B40", text: "çalışmıyor" },
];

export function MuscleMap({
  volume,
  missingCount = 0,
}: {
  volume: MuscleVolume;
  missingCount?: number;
}) {
  const worked = MUSCLE_KEYS.filter((k) => volume[k] > 0).sort((a, b) => volume[b] - volume[a]);
  const idle = MUSCLE_KEYS.filter((k) => volume[k] === 0);

  return (
    <div className="fit-card p-4">
      <svg
        viewBox={SHAPE_VIEWBOX}
        className="w-full"
        role="img"
        aria-label="Kas haritası: ön ve arka görünüm"
      >
        {MUSCLE_SHAPES.map((shape, i) => {
          const key = keyForShape(shape.id);
          const sets = key ? volume[key] : 0;
          return (
            <path
              key={`${shape.id}-${i}`}
              d={shape.d}
              fill={key ? muscleColor(sets) : "#33343A"}
              fillOpacity={key && sets > 0 ? 0.92 : 0.7}
              stroke="var(--color-bg)"
              strokeWidth={0.14}
              strokeLinejoin="round"
            >
              {key && <title>{`${MUSCLE_LABELS[key]} — ${formatNum(sets)} set`}</title>}
            </path>
          );
        })}
      </svg>

      <div className="flex flex-wrap gap-3 justify-center mt-3" style={{ fontSize: "11px" }}>
        {LEGEND.map((item) => (
          <span key={item.text} className="text-muted flex items-center gap-1">
            <i
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: item.color,
                display: "inline-block",
              }}
            />
            {item.text}
          </span>
        ))}
      </div>

      {worked.length > 0 && (
        <p className="text-muted mt-3" style={{ fontSize: "12px" }}>
          <span className="font-display">{upper("En çok")}: </span>
          {worked
            .slice(0, 3)
            .map((k) => `${MUSCLE_LABELS[k]} ${formatNum(volume[k])}`)
            .join(" · ")}
        </p>
      )}

      {idle.length > 0 && (
        <p className="text-muted" style={{ fontSize: "12px" }}>
          <span className="font-display">{upper("Çalışmıyor")}: </span>
          {idle.map((k) => MUSCLE_LABELS[k]).join(" · ")}
        </p>
      )}

      {missingCount > 0 && (
        <p className="text-muted mt-2" style={{ fontSize: "11px" }}>
          {missingCount} hareketin kas verisi yok, haritaya girmedi.
        </p>
      )}
    </div>
  );
}
