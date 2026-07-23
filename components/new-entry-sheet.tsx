"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, Trophy, X } from "lucide-react";
import { formatNum } from "@/lib/design";
import { saveExerciseEntry } from "@/app/actions/exercise-entries";

const QUICK_STEPS = [-5, -1.25, 1.25, 5, 10];

/**
 * FAB + alttan açılan yeni kayıt paneli (plan.md §12 — hareket).
 * PR kırılırsa kısa kutlama rozeti gösterilir.
 */
export function NewEntrySheet({
  exerciseId,
  exerciseName,
  lastWeight,
  today,
  defaultSets = 3,
  defaultReps = 5,
  autoOpen = false,
}: {
  exerciseId: string;
  exerciseName: string;
  lastWeight: number;
  today: string;
  /** Rutinden gelen hedef set/tekrar */
  defaultSets?: number;
  defaultReps?: number;
  /** Rutinde "kaydet"e basıldıysa panel doğrudan açılır */
  autoOpen?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(autoOpen);
  const [weight, setWeight] = useState(lastWeight);
  const [sets, setSets] = useState(defaultSets);
  const [reps, setReps] = useState(defaultReps);
  const [performedAt, setPerformedAt] = useState(today);
  const [error, setError] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [pending, startTransition] = useTransition();

  function openSheet() {
    setWeight(lastWeight);
    setSets(defaultSets);
    setReps(defaultReps);
    setPerformedAt(today);
    setError(null);
    setOpen(true);
  }

  function bump(delta: number) {
    setWeight((w) => Math.max(0, Number((w + delta).toFixed(2))));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveExerciseEntry({
        exerciseId,
        weightKg: weight,
        reps,
        sets,
        performedAt,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpen(false);
      router.refresh();

      if (result.isNewPr) {
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 2200);
      }
    });
  }

  return (
    <>
      {celebrating && (
        <div
          className="fixed inset-x-0 flex justify-center"
          style={{ top: "16px", zIndex: 40 }}
        >
          <div className="pr-badge" style={{ position: "static" }}>
            <Trophy size={14} /> Yeni Rekor!
          </div>
        </div>
      )}

      <button onClick={openSheet} className="fab" aria-label="Yeni kayıt ekle">
        <Plus size={24} />
      </button>

      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(false)}>
          <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold">Yeni Kayıt</h3>
              <button onClick={() => setOpen(false)} aria-label="Kapat">
                <X size={20} style={{ color: "var(--color-muted)" }} />
              </button>
            </div>
            <p className="text-sm text-muted mb-5">{exerciseName}</p>

            <div className="flex items-center justify-center gap-5 mb-5">
              <button onClick={() => bump(-2.5)} className="stepper-btn" aria-label="2,5 kg azalt">
                <Minus size={18} />
              </button>
              <div className="text-center" style={{ minWidth: "110px" }}>
                <span className="font-display" style={{ fontSize: "44px" }}>
                  {formatNum(weight)}
                </span>
                <p className="text-muted" style={{ fontSize: "11px", letterSpacing: "0.1em" }}>
                  KG
                </p>
              </div>
              <button onClick={() => bump(2.5)} className="stepper-btn" aria-label="2,5 kg artır">
                <Plus size={18} />
              </button>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {QUICK_STEPS.map((step) => (
                <button key={step} onClick={() => bump(step)} className="quick-chip">
                  {step > 0 ? `+${formatNum(step)}` : formatNum(step)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="field-label">Set</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSets((s) => Math.max(1, s - 1))}
                    className="mini-btn"
                    aria-label="Set azalt"
                  >
                    −
                  </button>
                  <span className="font-mono text-base flex-1 text-center">{sets}</span>
                  <button
                    onClick={() => setSets((s) => Math.min(99, s + 1))}
                    className="mini-btn"
                    aria-label="Set artır"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="field-label">Tekrar</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReps((r) => Math.max(1, r - 1))}
                    className="mini-btn"
                    aria-label="Tekrar azalt"
                  >
                    −
                  </button>
                  <span className="font-mono text-base flex-1 text-center">{reps}</span>
                  <button
                    onClick={() => setReps((r) => Math.min(999, r + 1))}
                    className="mini-btn"
                    aria-label="Tekrar artır"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="field-label" htmlFor="performedAt">
                TARİH
              </label>
              <input
                id="performedAt"
                type="date"
                value={performedAt}
                max={today}
                onChange={(e) => setPerformedAt(e.target.value)}
                className="fit-input w-full rounded-2xl px-4 py-3 text-sm font-mono outline-none"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm mb-3" style={{ color: "var(--color-plate-red)" }}>
                {error}
              </p>
            )}

            <button onClick={save} className="save-btn" disabled={pending}>
              <Check size={18} /> {pending ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
