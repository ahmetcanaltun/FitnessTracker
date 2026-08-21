import Link from "next/link";
import { Minus, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNum, plateColor, upper } from "@/lib/design";
import { relativeDayLabel } from "@/lib/dates";
import { ExerciseSearch } from "@/components/exercise-search";
import { Sparkline } from "@/components/sparkline";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const query = first(sp.q);
  const category = first(sp.kategori);
  const isFiltering = Boolean(query || category);

  // Kas grubu chip'leri: katalogda gerçekten var olan kategoriler
  const categoryRows = await prisma.exercise.groupBy({
    by: ["category"],
    // Yalnızca ana katalog: eski wger satırları aramada görünmez (bkz. lib/muscles.ts)
    where: { source: "fedb", category: { not: null } },
    orderBy: { category: "asc" },
  });
  const categories = categoryRows
    .map((row) => row.category)
    .filter((c): c is string => Boolean(c));

  // Kullanıcının kayıt girdiği hareketler, en son çalışılan başta
  const loggedGroups = await prisma.exerciseEntry.groupBy({
    by: ["exerciseId"],
    where: { userId: user.id },
    _max: { performedAt: true },
    orderBy: { _max: { performedAt: "desc" } },
  });
  const loggedIds = loggedGroups.map((g) => g.exerciseId);

  // Filtre yokken ana ekran "senin hareketlerin"; filtre varken tüm katalogda arama.
  let exercises;
  if (isFiltering) {
    exercises = await prisma.exercise.findMany({
      where: {
        source: "fedb",
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" as const } },
                { nameEn: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { name: "asc" },
      take: 60,
    });
  } else if (loggedIds.length > 0) {
    const rows = await prisma.exercise.findMany({ where: { id: { in: loggedIds } } });
    const byId = new Map(rows.map((r) => [r.id, r]));
    exercises = loggedIds.map((id) => byId.get(id)).filter((e) => e !== undefined);
  } else {
    // Henüz hiç kayıt yok: katalogdan bir başlangıç listesi göster
    exercises = await prisma.exercise.findMany({
      where: { source: "fedb" },
      orderBy: { name: "asc" },
      take: 24,
    });
  }

  // Gösterilen hareketlerin geçmişi tek sorguda (sparkline + son ağırlık için)
  const shownIds = exercises.map((e) => e.id);
  const entries = shownIds.length
    ? await prisma.exerciseEntry.findMany({
        where: { userId: user.id, exerciseId: { in: shownIds } },
        select: { exerciseId: true, weightKg: true, performedAt: true },
        orderBy: { performedAt: "asc" },
      })
    : [];

  const historyByExercise = new Map<string, { kg: number; date: Date }[]>();
  for (const entry of entries) {
    const list = historyByExercise.get(entry.exerciseId) ?? [];
    list.push({ kg: Number(entry.weightKg), date: entry.performedAt });
    historyByExercise.set(entry.exerciseId, list);
  }

  return (
    <>
      <div
        className="sticky top-0 z-10 px-5 pt-6 pb-4"
        style={{ background: "linear-gradient(to bottom, var(--color-bg) 75%, transparent)" }}
      >
        <div className="mb-4">
          <h1 className="page-title">{upper("Hareketler")}</h1>
          <p className="page-sub">Katalogda ara, kayıtlarını gör.</p>
        </div>

        <ExerciseSearch
          categories={categories}
          initialQuery={query}
          initialCategory={category}
        />
      </div>

      <div className="px-5 flex flex-col gap-3 pb-28 pt-2">
        {!isFiltering && loggedIds.length === 0 && (
          <p className="text-sm text-muted pb-1">
            Henüz kaydın yok. Bir hareket seçip ilk ağırlığını gir.
          </p>
        )}

        {exercises.map((exercise, i) => {
          const history = historyByExercise.get(exercise.id) ?? [];
          const last = history.at(-1);
          const prev = history.at(-2);
          const pr = history.reduce((max, h) => Math.max(max, h.kg), 0);
          const colors = plateColor(last?.kg ?? 0);

          const trend = prev && last
            ? last.kg > prev.kg
              ? "up"
              : last.kg < prev.kg
                ? "down"
                : "flat"
            : "flat";

          return (
            <Link
              key={exercise.id}
              href={`/exercises/${exercise.id}`}
              className="fit-card card-enter flex items-center gap-4 p-4 text-left w-full"
              style={{ animationDelay: `${Math.min(i, 12) * 60}ms` }}
            >
              {last ? (
                <div
                  className="plate-badge shrink-0"
                  style={{ background: colors.bg, color: colors.text }}
                >
                  <span className="font-display" style={{ fontSize: "18px", lineHeight: 1 }}>
                    {formatNum(last.kg)}
                  </span>
                  <span
                    style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.08em", opacity: 0.85 }}
                  >
                    KG
                  </span>
                </div>
              ) : (
                // Henüz kaydı olmayan hareket: boş disk
                <div
                  className="plate-badge shrink-0"
                  style={{ background: "var(--color-surface-2)", color: "var(--color-muted)" }}
                >
                  <span className="font-display" style={{ fontSize: "18px", lineHeight: 1 }}>
                    —
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ fontSize: "15px" }}>
                  {exercise.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {/* Son kayıt aynı zamanda rekorsa kategori yerine PR rozeti */}
                  {last && last.kg >= pr ? (
                    <span
                      className="fit-tag inline-flex items-center gap-1"
                      style={{ background: "rgba(232,183,44,0.16)", color: "var(--color-plate-yellow)" }}
                    >
                      <Trophy size={10} /> PR
                    </span>
                  ) : (
                    exercise.category && <span className="fit-tag">{exercise.category}</span>
                  )}
                  <span className="font-mono text-muted text-caption truncate">
                    {last ? relativeDayLabel(last.date) : (exercise.equipment ?? "")}
                  </span>
                  {/* Güncel ağırlık rekorun altındaysa hedefi göster */}
                  {last && pr > last.kg && (
                    <span className="font-mono text-muted text-caption whitespace-nowrap">
                      · rekor {formatNum(pr)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <Sparkline values={history.slice(-6).map((h) => h.kg)} color={colors.bg} />
                {history.length > 1 && (
                  <>
                    {trend === "up" && <TrendingUp size={12} style={{ color: "var(--color-plate-green)" }} />}
                    {trend === "down" && <TrendingDown size={12} style={{ color: "var(--color-plate-red)" }} />}
                    {trend === "flat" && <Minus size={12} style={{ color: "var(--color-muted)" }} />}
                  </>
                )}
              </div>
            </Link>
          );
        })}

        {exercises.length === 0 && (
          <div className="text-center py-16 text-muted">
            <p className="text-sm">Aradığın hareket bulunamadı.</p>
          </div>
        )}
      </div>
    </>
  );
}
