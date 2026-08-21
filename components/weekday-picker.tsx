"use client";

import { useState, useTransition } from "react";
import { updateRoutineWeekdays } from "@/app/actions/routines";
import { upper } from "@/lib/design";

const DAYS = [
  { value: 1, label: "Pzt" },
  { value: 2, label: "Sal" },
  { value: 3, label: "Çar" },
  { value: 4, label: "Per" },
  { value: 5, label: "Cum" },
  { value: 6, label: "Cmt" },
  { value: 7, label: "Paz" },
];

export function WeekdayPicker({
  routineId,
  initial,
}: {
  routineId: string;
  initial: number[];
}) {
  const [selected, setSelected] = useState<number[]>(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(day: number) {
    const previous = selected;
    const next = previous.includes(day)
      ? previous.filter((d) => d !== day)
      : [...previous, day].sort((a, b) => a - b);

    setSelected(next);
    setError(null);
    startTransition(async () => {
      const result = await updateRoutineWeekdays(routineId, next);
      if (!result.ok) {
        setSelected(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div className="mb-5">
      <p className="field-label">{upper("Hangi günler")}</p>
      <div className="flex flex-wrap gap-2">
        {DAYS.map((day) => {
          const active = selected.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggle(day.value)}
              disabled={pending}
              aria-pressed={active}
              data-active={active}
              className="fit-chip"
            >
              {day.label}
            </button>
          );
        })}
      </div>
      <p className="text-muted mt-2" style={{ fontSize: "11px" }}>
        {selected.length === 0
          ? "Gün seçilmezse bu rutin haftalık kas dağılımına girmez."
          : `Haftada ${selected.length} kez.`}
      </p>
      {error && (
        <p className="mt-2" style={{ fontSize: "12px", color: "var(--color-plate-red)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
