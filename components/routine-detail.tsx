"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { formatNum, upper } from "@/lib/design";
import { searchExercises, type ExerciseOption } from "@/app/actions/exercise-picker";
import {
  addRoutineItem,
  deleteRoutine,
  moveRoutineItem,
  removeRoutineItem,
} from "@/app/actions/routines";

export type RoutineItemView = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category: string | null;
  targetSets: number | null;
  targetReps: number | null;
  targetWeightKg: number | null;
  /** Hedef girilmemişse öneri olarak gösterilen son kayıt */
  lastWeightKg: number | null;
};

export function RoutineDetail({
  routineId,
  name,
  notes,
  items,
}: {
  routineId: string;
  name: string;
  notes: string | null;
  items: RoutineItemView[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok && result.error) setError(result.error);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-2xl">{upper(name)}</h1>
        {confirmDelete ? (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() =>
                startTransition(async () => {
                  await deleteRoutine(routineId);
                  router.push("/routines");
                })
              }
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: "var(--color-plate-red)", color: "#fff" }}
            >
              Sil
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-muted px-1">
              Vazgeç
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Rutini sil"
            className="shrink-0 mt-1"
            style={{ color: "var(--color-muted)", lineHeight: 0 }}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      {notes && <p className="text-sm text-muted mb-5">{notes}</p>}
      {!notes && <div className="mb-5" />}

      {error && (
        <p role="alert" className="text-sm mb-3" style={{ color: "var(--color-plate-red)" }}>
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <div className="fit-card p-6 text-center text-sm text-muted mb-4">
          Bu rutinde henüz hareket yok.
        </div>
      ) : (
        <div className="flex flex-col gap-2 mb-4">
          {items.map((item, index) => {
            // Hedef ağırlık yoksa son kayıt önerilir; o da yoksa boş bırakılır
            const weight = item.targetWeightKg ?? item.lastWeightKg;
            const params = new URLSearchParams();
            if (item.targetSets) params.set("set", String(item.targetSets));
            if (item.targetReps) params.set("tekrar", String(item.targetReps));
            if (weight !== null) params.set("kg", String(weight));
            params.set("kayit", "1");

            return (
              <div key={item.id} className="fit-card p-4">
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono shrink-0 text-muted"
                    style={{ fontSize: "12px", width: "18px" }}
                  >
                    {index + 1}
                  </span>

                  <Link
                    href={`/exercises/${item.exerciseId}?${params}`}
                    className="flex-1 min-w-0"
                  >
                    <p className="font-semibold truncate" style={{ fontSize: "15px" }}>
                      {item.exerciseName}
                    </p>
                    <p className="font-mono text-muted" style={{ fontSize: "11px" }}>
                      {item.targetSets ?? "—"}x{item.targetReps ?? "—"}
                      {weight !== null && ` · ${formatNum(weight)} kg`}
                      {item.targetWeightKg === null && weight !== null && " (son kayıt)"}
                    </p>
                  </Link>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => run(() => moveRoutineItem(item.id, "up"))}
                      disabled={index === 0}
                      aria-label="Yukarı taşı"
                      style={{ color: "var(--color-muted)", opacity: index === 0 ? 0.3 : 1, lineHeight: 0, padding: "4px" }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => run(() => moveRoutineItem(item.id, "down"))}
                      disabled={index === items.length - 1}
                      aria-label="Aşağı taşı"
                      style={{
                        color: "var(--color-muted)",
                        opacity: index === items.length - 1 ? 0.3 : 1,
                        lineHeight: 0,
                        padding: "4px",
                      }}
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => run(() => removeRoutineItem(item.id))}
                      aria-label={`${item.exerciseName} hareketini çıkar`}
                      style={{ color: "var(--color-muted)", lineHeight: 0, padding: "4px" }}
                    >
                      <Trash2 size={14} />
                    </button>
                    <Link
                      href={`/exercises/${item.exerciseId}?${params}`}
                      aria-label={`${item.exerciseName} kaydet`}
                      style={{ color: "var(--color-plate-red)", lineHeight: 0, padding: "4px" }}
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setAdding(true)}
        className="fit-card w-full p-4 flex items-center justify-center gap-2 text-sm"
      >
        <Plus size={16} style={{ color: "var(--color-muted)" }} />
        Hareket Ekle
      </button>

      {adding && (
        <AddItemSheet
          routineId={routineId}
          onClose={() => setAdding(false)}
          onAdded={() => {
            setAdding(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function AddItemSheet({
  routineId,
  onClose,
  onAdded,
}: {
  routineId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ExerciseOption[]>([]);
  const [selected, setSelected] = useState<ExerciseOption | null>(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(5);
  const [weight, setWeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(async () => {
      const rows = await searchExercises(query);
      if (!cancelled) setResults(rows);
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  function save() {
    if (!selected) return;
    setError(null);

    const parsedWeight = weight.trim() === "" ? null : Number(weight.replace(",", "."));
    if (parsedWeight !== null && !Number.isFinite(parsedWeight)) {
      setError("Ağırlık sayı olmalı.");
      return;
    }

    startTransition(async () => {
      const result = await addRoutineItem({
        routineId,
        exerciseId: selected.id,
        targetSets: sets,
        targetReps: reps,
        targetWeightKg: parsedWeight,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onAdded();
    });
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "82vh", overflowY: "auto" }}
      >
        <div className="sheet-handle" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Hareket Ekle</h3>
          <button onClick={onClose} aria-label="Kapat">
            <X size={20} style={{ color: "var(--color-muted)" }} />
          </button>
        </div>

        {!selected ? (
          <>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl fit-input mb-3">
              <Search size={16} style={{ color: "var(--color-muted)" }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Hareket ara..."
                aria-label="Hareket ara"
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
            <div className="flex flex-col gap-2" style={{ maxHeight: "300px", overflowY: "auto" }}>
              {results.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => setSelected(exercise)}
                  className="fit-card flex items-center justify-between px-4 py-3 text-left w-full gap-3"
                >
                  <span className="text-sm min-w-0 truncate">{exercise.name}</span>
                  {exercise.category && (
                    <span className="fit-tag shrink-0">{exercise.category}</span>
                  )}
                </button>
              ))}
              {results.length === 0 && (
                <p className="text-sm text-center py-4 text-muted">Sonuç bulunamadı.</p>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setSelected(null)}
              className="text-sm mb-4"
              style={{ color: "var(--color-plate-blue)" }}
            >
              ← Aramaya dön
            </button>
            <p className="font-semibold mb-5">{selected.name}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="field-label">HEDEF SET</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSets((s) => Math.max(1, s - 1))} className="mini-btn">
                    −
                  </button>
                  <span className="font-mono text-base flex-1 text-center">{sets}</span>
                  <button onClick={() => setSets((s) => Math.min(99, s + 1))} className="mini-btn">
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="field-label">HEDEF TEKRAR</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setReps((r) => Math.max(1, r - 1))} className="mini-btn">
                    −
                  </button>
                  <span className="font-mono text-base flex-1 text-center">{reps}</span>
                  <button onClick={() => setReps((r) => Math.min(999, r + 1))} className="mini-btn">
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="field-label" htmlFor="target-weight">
                HEDEF AĞIRLIK (BOŞ BIRAKILIRSA SON KAYIT ÖNERİLİR)
              </label>
              <input
                id="target-weight"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="örn. 80"
                className="fit-input w-full rounded-2xl px-4 py-3 text-sm font-mono outline-none"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm mb-3" style={{ color: "var(--color-plate-red)" }}>
                {error}
              </p>
            )}

            <button onClick={save} className="save-btn" disabled={pending}>
              <Check size={18} /> {pending ? "Ekleniyor..." : "Rutine Ekle"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
