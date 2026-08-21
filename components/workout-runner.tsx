"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ChevronRight, SkipForward } from "lucide-react";
import { saveExerciseEntry } from "@/app/actions/exercise-entries";
import { RestTimer } from "@/components/rest-timer";
import { todayISO } from "@/lib/dates";
import { formatNum, upper } from "@/lib/design";

export type WorkoutItem = {
  exerciseId: string;
  name: string;
  targetSets: number | null;
  targetReps: number | null;
  targetWeightKg: number | null;
  lastWeightKg: number | null;
};

type Mode = "tek" | "set";

const REST_SECONDS = 90;

export function WorkoutRunner({
  routineId,
  routineName,
  items,
}: {
  routineId: string;
  routineName: string;
  items: WorkoutItem[];
}) {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("tek");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resting, setResting] = useState(false);
  // Hareket başına kaydedilen set sayısı — özet ekranı bunu kullanır
  const [done, setDone] = useState<Record<string, number>>({});

  const item = items[index];
  const finished = index >= items.length;

  // Değerler önden dolu gelir: rutin hedefi, yoksa son kayıt, o da yoksa makul varsayılan
  const [weight, setWeight] = useState(item?.targetWeightKg ?? item?.lastWeightKg ?? 20);
  const [reps, setReps] = useState(item?.targetReps ?? 8);
  const [sets, setSets] = useState(item?.targetSets ?? 3);

  function moveTo(next: number) {
    const target = items[next];
    setIndex(next);
    setError(null);
    setResting(false);
    if (target) {
      setWeight(target.targetWeightKg ?? target.lastWeightKg ?? 20);
      setReps(target.targetReps ?? 8);
      setSets(target.targetSets ?? 3);
    }
  }

  function save(setCount: number, advance: boolean) {
    if (!item) return;
    setError(null);
    startTransition(async () => {
      const result = await saveExerciseEntry({
        exerciseId: item.exerciseId,
        weightKg: weight,
        reps,
        sets: setCount,
        performedAt: todayISO(),
      });
      if (!result.ok) {
        setError(result.error ?? "Kayıt eklenemedi.");
        return;
      }
      setDone((prev) => ({ ...prev, [item.exerciseId]: (prev[item.exerciseId] ?? 0) + setCount }));
      if (advance) {
        moveTo(index + 1);
      } else {
        setResting(true);
      }
    });
  }

  if (finished) {
    const toplamSet = Object.values(done).reduce((a, b) => a + b, 0);
    const hareket = Object.keys(done).length;
    return (
      <div className="fit-card card-enter p-6 text-center">
        <p className="font-display" style={{ fontSize: "34px", lineHeight: 1.05 }}>
          {upper("Antrenman bitti")}
        </p>
        <p className="text-muted mt-2" style={{ fontSize: "14px" }}>
          {hareket} hareket · {toplamSet} set kaydedildi.
        </p>
        <Link href={`/routines/${routineId}`} className="save-btn mt-5 inline-block">
          Rutine dön
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="field-label">
          {upper(routineName)} · {index + 1}/{items.length}
        </p>
        <h1 className="font-display" style={{ fontSize: "30px", lineHeight: 1.05 }}>
          {upper(item.name)}
        </h1>
        {item.lastWeightKg !== null && (
          <p className="text-muted" style={{ fontSize: "12px" }}>
            Son kayıt: {formatNum(item.lastWeightKg)} kg
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="fit-chip"
          data-active={mode === "tek"}
          aria-pressed={mode === "tek"}
          onClick={() => setMode("tek")}
        >
          Tek kayıt
        </button>
        <button
          type="button"
          className="fit-chip"
          data-active={mode === "set"}
          aria-pressed={mode === "set"}
          onClick={() => setMode("set")}
        >
          Set set
        </button>
      </div>

      <div className="fit-card p-4 flex flex-col gap-4">
        <Stepper label="Ağırlık (kg)" value={weight} step={2.5} min={0} onChange={setWeight} />
        <Stepper label="Tekrar" value={reps} step={1} min={1} onChange={setReps} />
        {mode === "tek" && (
          <Stepper label="Set" value={sets} step={1} min={1} onChange={setSets} />
        )}
      </div>

      {resting && (
        <RestTimer
          seconds={REST_SECONDS}
          onDone={() => setResting(false)}
          onDismiss={() => setResting(false)}
        />
      )}

      {error && (
        <p style={{ fontSize: "13px", color: "var(--color-plate-red)" }}>{error}</p>
      )}

      <div className="flex gap-2">
        {mode === "set" ? (
          <>
            <button
              type="button"
              className="save-btn flex-1"
              disabled={pending}
              onClick={() => save(1, false)}
            >
              <Check size={16} /> Seti kaydet
              {done[item.exerciseId] ? ` (${done[item.exerciseId]})` : ""}
            </button>
            <button
              type="button"
              className="mini-btn"
              disabled={pending}
              aria-label="Sonraki harekete geç"
              onClick={() => moveTo(index + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="save-btn flex-1"
            disabled={pending}
            onClick={() => save(sets, true)}
          >
            <Check size={16} /> Kaydet ve sonraki
          </button>
        )}
        <button
          type="button"
          className="mini-btn"
          disabled={pending}
          aria-label="Bu hareketi atla"
          onClick={() => moveTo(index + 1)}
        >
          <SkipForward size={16} />
        </button>
      </div>
    </div>
  );
}

function Stepper({
  label,
  value,
  step,
  min,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  min: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="field-label">{upper(label)}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="stepper-btn"
          aria-label={`${label} azalt`}
          onClick={() => onChange(Math.max(min, Number((value - step).toFixed(2))))}
        >
          −
        </button>
        <span className="font-display flex-1 text-center" style={{ fontSize: "34px" }}>
          {formatNum(value)}
        </span>
        <button
          type="button"
          className="stepper-btn"
          aria-label={`${label} artır`}
          onClick={() => onChange(Number((value + step).toFixed(2)))}
        >
          +
        </button>
      </div>
    </div>
  );
}
