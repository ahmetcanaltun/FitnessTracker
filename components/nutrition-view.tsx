"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Droplet, Plus, Trash2 } from "lucide-react";
import { formatNum, ringColor } from "@/lib/design";
import { MEAL_LABELS, MEAL_TYPES } from "@/lib/meals";
import type { MealType } from "@/lib/generated/prisma/enums";
import { CountUp } from "@/components/count-up";
import { AddFoodSheet } from "@/components/add-food-sheet";
import { deleteMealEntry, setWaterCount } from "@/app/actions/nutrition";
import type { FoodOption } from "@/app/actions/foods";

export type MealEntryView = {
  id: string;
  mealType: MealType;
  name: string;
  portion: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type NutritionGoals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
};

const RING_RADIUS = 72;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function NutritionView({
  entries,
  goals,
  waterGlasses,
  initialFoods,
  loggedAt,
}: {
  entries: MealEntryView[];
  goals: NutritionGoals;
  waterGlasses: number;
  initialFoods: FoodOption[];
  loggedAt: string;
}) {
  const router = useRouter();
  const [sheetMeal, setSheetMeal] = useState<MealType | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Su sayacı hemen tepki versin: sunucu yanıtını beklemeden göster
  const [optimisticWater, setOptimisticWater] = useOptimistic(waterGlasses);

  const totals = entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const kcalPct = goals.kcal > 0 ? totals.kcal / goals.kcal : 0;

  function updateWater(next: number) {
    const clamped = Math.max(0, Math.min(goals.water + 6, next));
    startTransition(async () => {
      setOptimisticWater(clamped);
      await setWaterCount({ date: loggedAt, glassCount: clamped });
      router.refresh();
    });
  }

  function removeEntry(entryId: string) {
    startTransition(async () => {
      await deleteMealEntry(entryId);
      router.refresh();
    });
  }

  function openSheet(meal: MealType | null) {
    setSheetMeal(meal);
    setSheetOpen(true);
  }

  return (
    <div className="px-5 pt-6 pb-28">
      <p className="text-sm text-muted">Bugün</p>
      <h1 className="font-display text-2xl mb-5">BESLENME</h1>

      {/* Kalori halkası — disk rozetinin beslenme sekmesindeki karşılığı */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="relative flex items-center justify-center"
          style={{ width: "160px", height: "160px" }}
        >
          <svg
            width="160"
            height="160"
            style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
            aria-hidden
          >
            <circle
              cx="80"
              cy="80"
              r={RING_RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="6"
            />
            <circle
              cx="80"
              cy="80"
              r={RING_RADIUS}
              fill="none"
              stroke={ringColor(kcalPct)}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE - Math.min(kcalPct, 1) * RING_CIRCUMFERENCE}
              style={{ transition: "stroke-dashoffset .8s cubic-bezier(.16,1,.3,1)" }}
            />
          </svg>
          <div
            className="plate-badge-lg"
            style={{ background: "var(--color-surface-2)", color: "var(--color-ink)" }}
          >
            <span className="font-display" style={{ fontSize: "32px", lineHeight: 1 }}>
              <CountUp value={totals.kcal} />
            </span>
            <span className="text-muted" style={{ fontSize: "10px" }}>
              / {goals.kcal} KCAL
            </span>
          </div>
        </div>
        <p className="text-sm mt-3 text-muted">
          {totals.kcal <= goals.kcal
            ? `${Math.round(goals.kcal - totals.kcal)} kcal kaldı`
            : `${Math.round(totals.kcal - goals.kcal)} kcal aşıldı`}
        </p>
      </div>

      <div className="fit-card p-4 mb-5 flex flex-col gap-4">
        {[
          { label: "Protein", consumed: totals.protein, goal: goals.protein, color: "var(--color-plate-red)" },
          { label: "Karbonhidrat", consumed: totals.carbs, goal: goals.carbs, color: "var(--color-plate-blue)" },
          { label: "Yağ", consumed: totals.fat, goal: goals.fat, color: "var(--color-plate-yellow)" },
        ].map((macro) => (
          <div key={macro.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">{macro.label}</span>
              <span className="font-mono text-muted" style={{ fontSize: "12px" }}>
                {formatNum(macro.consumed)} / {macro.goal} g
              </span>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${Math.min(100, (macro.consumed / macro.goal) * 100)}%`,
                  background: macro.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Su takibi: tek butonla artır, damlalara tıklayarak da ayarlanabilir */}
      <div className="fit-card p-4 mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm">Su</span>
            <span className="font-mono text-muted" style={{ fontSize: "11px" }}>
              {optimisticWater}/{goals.water} bardak
              {optimisticWater > goals.water ? ` (+${optimisticWater - goals.water})` : ""}
            </span>
          </div>
          <div key={optimisticWater} className="drop-row flex gap-1.5 flex-wrap">
            {Array.from({ length: goals.water }).map((_, i) => {
              const filled = i < optimisticWater;
              return (
                <button
                  key={i}
                  onClick={() => updateWater(i + 1 === optimisticWater ? i : i + 1)}
                  style={{ lineHeight: 0 }}
                  aria-label={`${i + 1}. bardak`}
                >
                  <Droplet
                    size={18}
                    fill={filled ? "var(--color-plate-blue)" : "none"}
                    stroke={filled ? "var(--color-plate-blue)" : "var(--color-muted)"}
                    strokeWidth={1.8}
                  />
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => updateWater(optimisticWater + 1)}
          className="water-btn shrink-0"
          aria-label="Bir bardak su ekle"
        >
          <Plus size={20} />
        </button>
      </div>

      {MEAL_TYPES.map((mealType) => {
        const mealEntries = entries.filter((e) => e.mealType === mealType);
        return (
          <div key={mealType} className="fit-card p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">{MEAL_LABELS[mealType]}</span>
              <button
                onClick={() => openSheet(mealType)}
                className="add-food-btn"
                aria-label={`${MEAL_LABELS[mealType]} için besin ekle`}
              >
                <Plus size={14} />
              </button>
            </div>
            {mealEntries.length === 0 ? (
              <p className="text-xs text-muted">Henüz kayıt yok</p>
            ) : (
              mealEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-2 gap-2"
                  style={{ borderTop: "1px solid var(--color-hairline)" }}
                >
                  <div className="min-w-0">
                    <p className="text-sm truncate">{entry.name}</p>
                    <p className="font-mono text-muted" style={{ fontSize: "11px" }}>
                      {entry.portion}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-sm">{Math.round(entry.kcal)} kcal</span>
                    <button
                      onClick={() => removeEntry(entry.id)}
                      aria-label={`${entry.name} kaydını sil`}
                      style={{ color: "var(--color-muted)", lineHeight: 0 }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      })}

      <button onClick={() => openSheet(null)} className="fab" aria-label="Besin ekle">
        <Plus size={24} />
      </button>

      {sheetOpen && (
        <AddFoodSheet
          initialFoods={initialFoods}
          loggedAt={loggedAt}
          openMeal={sheetMeal}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}
