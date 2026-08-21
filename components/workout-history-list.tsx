import { Dumbbell } from "lucide-react";
import type { WorkoutDay } from "@/lib/workout-history";
import { dateFromISO, relativeDayLabel } from "@/lib/dates";
import { formatNum } from "@/lib/design";

export function WorkoutHistoryList({ days }: { days: WorkoutDay[] }) {
  if (days.length === 0) {
    return (
      <div className="fit-card p-5 text-center text-sm text-muted">
        Henüz antrenman kaydın yok. Bir rutini açıp &quot;Antrenmanı Başlat&quot; de.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {days.map((day, i) => (
        <div
          key={day.date}
          className="fit-card card-enter flex items-center gap-3 p-4"
          style={{ animationDelay: `${Math.min(i, 10) * 60}ms` }}
        >
          <div
            className="shrink-0 flex items-center justify-center"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "var(--color-surface-2)",
            }}
          >
            <Dumbbell size={18} style={{ color: "var(--color-plate-blue)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold" style={{ fontSize: "14px" }}>
              {relativeDayLabel(dateFromISO(day.date))}
            </p>
            <p className="text-muted truncate" style={{ fontSize: "11px" }}>
              {day.exerciseNames.join(" · ")}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display" style={{ fontSize: "20px", lineHeight: 1 }}>
              {day.totalSets}
            </p>
            <p className="text-muted" style={{ fontSize: "10px" }}>
              set · {formatNum(day.topWeightKg)} kg
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
