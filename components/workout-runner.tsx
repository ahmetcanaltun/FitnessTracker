"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ChevronRight, SkipForward } from "lucide-react";
import { saveExerciseEntry } from "@/app/actions/exercise-entries";
import { RestTimer } from "@/components/rest-timer";
import { PlateBadge } from "@/components/plate-badge";
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

/** Kaydedilmiş bir giriş. "Tek kayıt" modunda sets > 1 olabilir. */
type LoggedSet = {
  sets: number;
  weight: number;
  reps: number;
  rpe: number | null;
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
  // Hareket başına kaydedilen setler — hem set kaydı listesi hem özet bunu kullanır
  const [log, setLog] = useState<Record<string, LoggedSet[]>>({});

  const item = items[index];
  const finished = index >= items.length;

  // Değerler önden dolu gelir: rutin hedefi, yoksa son kayıt, o da yoksa makul varsayılan
  const [weight, setWeight] = useState(item?.targetWeightKg ?? item?.lastWeightKg ?? 20);
  const [reps, setReps] = useState(item?.targetReps ?? 8);
  const [sets, setSets] = useState(item?.targetSets ?? 3);
  // Set set modunda her set kendi zorluğunu taşır: kayıttan sonra sıfırlanır.
  const [rpe, setRpe] = useState<number | null>(null);

  function moveTo(next: number) {
    const target = items[next];
    setIndex(next);
    setError(null);
    setResting(false);
    setRpe(null);
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
        rpe,
      });
      if (!result.ok) {
        setError(result.error ?? "Kayıt eklenemedi.");
        return;
      }
      setLog((prev) => ({
        ...prev,
        [item.exerciseId]: [
          ...(prev[item.exerciseId] ?? []),
          { sets: setCount, weight, reps, rpe },
        ],
      }));
      if (advance) {
        moveTo(index + 1);
      } else {
        // Sonraki set kendi zorluğuyla kaydedilsin
        setRpe(null);
        setResting(true);
      }
    });
  }

  if (finished) {
    const entries = Object.values(log).flat();
    const toplamSet = entries.reduce((sum, entry) => sum + entry.sets, 0);
    const hareket = Object.keys(log).length;
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

  const doneSets = log[item.exerciseId] ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div
        className="workout-rail"
        role="img"
        aria-label={`${index + 1} / ${items.length} hareket`}
      >
        {items.map((railItem, i) => (
          <span
            key={railItem.exerciseId}
            className="rail-seg"
            data-state={i < index ? "done" : i === index ? "current" : "todo"}
          />
        ))}
      </div>

      <div>
        <p className="field-label">{upper(routineName)}</p>
        <h1 className="font-display" style={{ fontSize: "30px", lineHeight: 1.05 }}>
          {upper(item.name)}
        </h1>
        {/* Disk zaten hedefle (yoksa son kayıtla) dolu geliyor. Bu satır
            yalnızca ikisi farklıyken bilgi katar — yoksa aynı sayıyı tekrarlar. */}
        {item.lastWeightKg !== null &&
          item.targetWeightKg !== null &&
          item.targetWeightKg !== item.lastWeightKg && (
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
        {/* Ağırlık kontrolü diskin kendisi: renk ağırlıkla değişir (plateColor) */}
        <div>
          <p className="field-label">{upper("Ağırlık (kg)")}</p>
          <div className="weight-row flex items-center justify-between gap-2">
            <button
              type="button"
              className="stepper-btn-lg"
              aria-label="Ağırlık azalt"
              onClick={() => setWeight((w) => Math.max(0, Number((w - 2.5).toFixed(2))))}
            >
              −
            </button>
            <PlateBadge kg={weight} size="lg" />
            <button
              type="button"
              className="stepper-btn-lg"
              aria-label="Ağırlık artır"
              onClick={() => setWeight((w) => Number((w + 2.5).toFixed(2)))}
            >
              +
            </button>
          </div>
        </div>

        <Stepper label="Tekrar" value={reps} step={1} min={1} onChange={setReps} />
        {mode === "tek" && (
          <Stepper label="Set" value={sets} step={1} min={1} onChange={setSets} />
        )}
        {mode === "set" && (
          <div>
            <p className="field-label">{upper("Zorluk (RPE)")}</p>
            <div className="rpe-row flex flex-wrap gap-2">
              {[6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="fit-chip"
                  data-active={rpe === value}
                  aria-pressed={rpe === value}
                  onClick={() => setRpe(rpe === value ? null : value)}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className="text-muted mt-1" style={{ fontSize: "11px" }}>
              Her set için ayrı sorulur, isteğe bağlı. 6 = rahat, 10 = son tekrar zor bitti.
            </p>
          </div>
        )}
      </div>

      {/* Bu harekette kaydedilenler — ekran "ne yaptım" sorusuna cevap versin */}
      {doneSets.length > 0 && (
        <div className="fit-card p-4 pt-3">
          <p className="field-label">{upper("Kaydedilen")}</p>
          {doneSets.map((entry, i) => (
            <div key={i} className="set-row">
              <span className="text-muted">{i + 1}.</span>
              <span className="flex-1">
                {formatNum(entry.weight)} kg × {entry.reps}
                {entry.sets > 1 ? ` · ${entry.sets} set` : ""}
              </span>
              {entry.rpe !== null && <span className="fit-tag">RPE {entry.rpe}</span>}
            </div>
          ))}
        </div>
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
            </button>
            <button
              type="button"
              className="stepper-btn-lg"
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
          className="stepper-btn-lg"
          disabled={pending}
          aria-label="Bu hareketi atla"
          onClick={() => moveTo(index + 1)}
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Sabit sayaç butonları örtmesin: sayfa o kadar aşağı kaydırılabilsin */}
      {resting && <div aria-hidden style={{ height: "96px" }} />}

      {resting && (
        <div className="rest-dock card-enter">
          <RestTimer
            seconds={REST_SECONDS}
            onDone={() => setResting(false)}
            onDismiss={() => setResting(false)}
          />
        </div>
      )}
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
