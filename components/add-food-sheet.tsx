"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Globe, Minus, Plus, Search, X } from "lucide-react";
import { formatNum } from "@/lib/design";
import { MEAL_LABELS, MEAL_TYPES } from "@/lib/meals";
import type { MealType } from "@/lib/generated/prisma/enums";
import type { OffProduct } from "@/lib/openfoodfacts";
import { importFood, searchFoods, searchOnline, type FoodOption } from "@/app/actions/foods";
import { saveMealEntry } from "@/app/actions/nutrition";

export function AddFoodSheet({
  initialFoods,
  loggedAt,
  openMeal,
  onClose,
}: {
  initialFoods: FoodOption[];
  loggedAt: string;
  openMeal: MealType | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [meal, setMeal] = useState<MealType>(openMeal ?? "kahvalti");
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState(initialFoods);
  const [selected, setSelected] = useState<FoodOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [online, setOnline] = useState<OffProduct[]>([]);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);

  // Arama sunucuda yapılır: katalog büyüdükçe (içe aktarılan OFF ürünleriyle)
  // istemciye tüm listeyi göndermek gerekmesin.
  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(async () => {
      const results = await searchFoods(query);
      if (!cancelled) setFoods(results);
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  // Yazı değişince önceki internet sonuçları kalmasın — effect yerine
  // doğrudan handler'da, aksi halde gereksiz bir render turu oluşuyor.
  function updateQuery(value: string) {
    setQuery(value);
    setOnline([]);
    setOnlineError(null);
  }

  function runOnlineSearch() {
    setOnlineError(null);
    setSearching(true);
    startTransition(async () => {
      const result = await searchOnline(query);
      setSearching(false);
      if (result.ok) {
        setOnline(result.products);
      } else {
        setOnlineError(result.error);
      }
    });
  }

  /** OFF sonucu seçilince önce yerel tabloya aktarılır, sonra miktar ekranına geçilir. */
  function pickOnline(product: OffProduct) {
    setImporting(product.code);
    startTransition(async () => {
      try {
        const food = await importFood(product);
        setSelected(food);
        setQuantity(1);
        setOnline([]);
      } catch {
        setOnlineError("Ürün aktarılamadı.");
      } finally {
        setImporting(null);
      }
    });
  }

  function save() {
    if (!selected) return;
    setError(null);

    startTransition(async () => {
      const result = await saveMealEntry({
        foodItemId: selected.id,
        mealType: meal,
        quantity,
        loggedAt,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onClose();
      router.refresh();
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
          <h3 className="font-semibold">Besin Ekle</h3>
          <button onClick={onClose} aria-label="Kapat">
            <X size={20} style={{ color: "var(--color-muted)" }} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
          {MEAL_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setMeal(type)}
              className="fit-chip shrink-0"
              data-active={meal === type}
            >
              {MEAL_LABELS[type]}
            </button>
          ))}
        </div>

        {!selected ? (
          <>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl fit-input mb-3">
              <Search size={16} style={{ color: "var(--color-muted)" }} />
              <input
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                placeholder="Besin ara (tavuk, pirinç...)"
                aria-label="Besin ara"
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>

            <div className="flex flex-col gap-2" style={{ maxHeight: "220px", overflowY: "auto" }}>
              {foods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => {
                    setSelected(food);
                    setQuantity(1);
                  }}
                  className="fit-card flex items-center justify-between px-4 py-3 text-left w-full gap-3"
                >
                  <span className="text-sm min-w-0 truncate">{food.name}</span>
                  <span className="font-mono text-muted shrink-0" style={{ fontSize: "12px" }}>
                    {formatNum(food.kcal)} kcal / {food.unit}
                  </span>
                </button>
              ))}

              {/* İnternet sonuçları — henüz kaydedilmedi, seçilince aktarılır */}
              {online.map((product) => (
                <button
                  key={product.code}
                  onClick={() => pickOnline(product)}
                  disabled={importing !== null}
                  className="fit-card flex items-center justify-between px-4 py-3 text-left w-full gap-3"
                  style={{ borderStyle: "dashed", opacity: importing === product.code ? 0.5 : 1 }}
                >
                  <span className="min-w-0">
                    <span className="text-sm block truncate">{product.name}</span>
                    <span className="text-muted" style={{ fontSize: "10px" }}>
                      {product.brand ? `${product.brand} · ` : ""}Open Food Facts
                    </span>
                  </span>
                  <span className="font-mono text-muted shrink-0" style={{ fontSize: "12px" }}>
                    {formatNum(product.kcal)} kcal / 100g
                  </span>
                </button>
              ))}

              {foods.length === 0 && online.length === 0 && !searching && (
                <p className="text-sm text-center py-4 text-muted">
                  {query.trim() ? "Yerel listede yok." : "Sonuç bulunamadı."}
                </p>
              )}

              {searching && (
                <p className="text-sm text-center py-3 text-muted">İnternette aranıyor...</p>
              )}

              {onlineError && (
                <p className="text-sm text-center py-2 text-muted">{onlineError}</p>
              )}
            </div>

            {/* Yerel katalog yetmediğinde açık bir kaçış yolu */}
            {query.trim().length >= 3 && online.length === 0 && !searching && (
              <button
                onClick={runOnlineSearch}
                className="fit-card w-full mt-3 py-3 flex items-center justify-center gap-2 text-sm"
                style={{ color: "var(--color-plate-blue)" }}
              >
                <Globe size={15} /> Open Food Facts&apos;te ara
              </button>
            )}
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
            <p className="font-semibold mb-1">{selected.name}</p>
            <p className="text-sm mb-5 text-muted">
              {formatNum(selected.kcal)} kcal / {selected.unit}
            </p>

            <div className="flex items-center justify-center gap-5 mb-5">
              <button
                onClick={() => setQuantity((q) => Math.max(0.5, Number((q - 0.5).toFixed(1))))}
                className="stepper-btn"
                aria-label="Miktar azalt"
              >
                <Minus size={18} />
              </button>
              <div className="text-center" style={{ minWidth: "110px" }}>
                <span className="font-display" style={{ fontSize: "40px" }}>
                  {formatNum(quantity)}
                </span>
                <p className="text-muted" style={{ fontSize: "11px" }}>
                  {selected.unit}
                </p>
              </div>
              <button
                onClick={() => setQuantity((q) => Number((q + 0.5).toFixed(1)))}
                className="stepper-btn"
                aria-label="Miktar artır"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="fit-card p-3 mb-6 flex justify-around text-center">
              <div>
                <p className="font-mono text-sm">{Math.round(selected.kcal * quantity)}</p>
                <p className="text-muted" style={{ fontSize: "10px" }}>
                  kcal
                </p>
              </div>
              <div>
                <p className="font-mono text-sm" style={{ color: "var(--color-plate-red)" }}>
                  {formatNum(selected.protein * quantity)}g
                </p>
                <p className="text-muted" style={{ fontSize: "10px" }}>
                  protein
                </p>
              </div>
              <div>
                <p className="font-mono text-sm" style={{ color: "var(--color-plate-blue)" }}>
                  {formatNum(selected.carbs * quantity)}g
                </p>
                <p className="text-muted" style={{ fontSize: "10px" }}>
                  karb.
                </p>
              </div>
              <div>
                <p className="font-mono text-sm" style={{ color: "var(--color-plate-yellow)" }}>
                  {formatNum(selected.fat * quantity)}g
                </p>
                <p className="text-muted" style={{ fontSize: "10px" }}>
                  yağ
                </p>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm mb-3" style={{ color: "var(--color-plate-red)" }}>
                {error}
              </p>
            )}

            <button onClick={save} className="save-btn" disabled={pending}>
              <Check size={18} /> {pending ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
