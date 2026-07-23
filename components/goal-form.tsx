"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Target } from "lucide-react";
import { saveNutritionGoal } from "@/app/actions/nutrition";

type Goals = {
  kcalGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  waterGoalGlasses: number;
};

const FIELDS: { key: keyof Goals; label: string; suffix: string }[] = [
  { key: "kcalGoal", label: "Kalori", suffix: "kcal" },
  { key: "proteinGoal", label: "Protein", suffix: "g" },
  { key: "carbsGoal", label: "Karbonhidrat", suffix: "g" },
  { key: "fatGoal", label: "Yağ", suffix: "g" },
  { key: "waterGoalGlasses", label: "Su", suffix: "bardak" },
];

export function GoalForm({ initial }: { initial: Goals }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [goals, setGoals] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveNutritionGoal(goals);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fit-card w-full p-4 flex items-center justify-center gap-2 text-sm"
      >
        <Target size={16} style={{ color: "var(--color-muted)" }} />
        Beslenme Hedefleri
      </button>
    );
  }

  return (
    <div className="fit-card w-full p-4 text-left">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-sm">Beslenme Hedefleri</span>
        <button onClick={() => setOpen(false)} className="text-sm text-muted">
          Kapat
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {FIELDS.map((field) => (
          <div key={field.key} className="flex items-center justify-between gap-3">
            <label className="text-sm" htmlFor={field.key}>
              {field.label}
            </label>
            <div className="flex items-center gap-2">
              <input
                id={field.key}
                type="number"
                inputMode="numeric"
                value={goals[field.key]}
                onChange={(e) =>
                  setGoals((g) => ({ ...g, [field.key]: Number(e.target.value) }))
                }
                className="fit-input rounded-xl px-3 py-2 text-sm font-mono outline-none w-24 text-right"
              />
              <span className="text-muted" style={{ fontSize: "11px", width: "44px" }}>
                {field.suffix}
              </span>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-sm mt-3" style={{ color: "var(--color-plate-red)" }}>
          {error}
        </p>
      )}

      <button onClick={save} className="save-btn mt-4" disabled={pending}>
        <Check size={18} />
        {pending ? "Kaydediliyor..." : saved ? "Kaydedildi" : "Kaydet"}
      </button>
    </div>
  );
}
