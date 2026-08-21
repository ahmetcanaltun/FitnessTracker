import Link from "next/link";
import { Play, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dateFromISO, todayISO, todayWeekday, relativeDayLabel, toISODate } from "@/lib/dates";
import { formatNum, upper } from "@/lib/design";
import { groupWorkoutDays } from "@/lib/workout-history";
import { calculateStreak } from "@/lib/streak";

export default async function TodayPage() {
  const user = await requireUser();
  const today = todayISO();
  const weekday = todayWeekday();

  const [routines, goal, meals, recent, allDates] = await Promise.all([
    prisma.routine.findMany({
      where: { userId: user.id, weekdays: { has: weekday } },
      orderBy: { updatedAt: "desc" },
      include: { items: { select: { id: true } } },
    }),
    prisma.nutritionGoal.findUnique({ where: { userId: user.id } }),
    prisma.mealEntry.findMany({
      where: { userId: user.id, loggedAt: dateFromISO(today) },
      select: { kcal: true },
    }),
    prisma.exerciseEntry.findMany({
      where: { userId: user.id },
      orderBy: [{ performedAt: "desc" }, { createdAt: "desc" }],
      take: 60,
      select: {
        performedAt: true,
        sets: true,
        reps: true,
        weightKg: true,
        exercise: { select: { name: true } },
      },
    }),
    // Seri: kayıt girilen tekil günler (lib/streak.ts bunları bekliyor)
    prisma.exerciseEntry.findMany({
      where: { userId: user.id },
      distinct: ["performedAt"],
      orderBy: { performedAt: "desc" },
      select: { performedAt: true },
    }),
  ]);

  const streak = calculateStreak(allDates.map((row) => row.performedAt));

  const kcalGoal = goal?.kcalGoal ?? 2600;
  const kcalToday = meals.reduce((sum, meal) => sum + Number(meal.kcal), 0);
  const kcalLeft = Math.max(kcalGoal - kcalToday, 0);

  const days = groupWorkoutDays(
    recent.map((entry) => ({
      performedAt: toISODate(entry.performedAt),
      exerciseName: entry.exercise.name,
      sets: entry.sets,
      reps: entry.reps,
      weightKg: Number(entry.weightKg),
    })),
  );
  const lastWorkout = days[0] ?? null;

  return (
    <div className="px-5 pt-6 pb-28">
      <div className="flex items-baseline justify-between gap-3 mb-5">
        <div>
          <p className="field-label">{upper("Merhaba")}</p>
          <h1 className="page-title">{upper(user.name)}</h1>
        </div>
        {streak > 0 && <span className="fit-tag shrink-0">{streak} gün seri</span>}
      </div>

      <h2 className="section-title mb-2">{upper("Bugünün antrenmanı")}</h2>
      {routines.length === 0 ? (
        <div className="fit-card p-5 text-small text-muted mb-6">
          Bugüne atanmış rutin yok.{" "}
          <Link href="/routines" style={{ color: "var(--color-plate-blue)" }}>
            Rutinlerine git
          </Link>{" "}
          ve günlerini seç.
        </div>
      ) : (
        <div className="flex flex-col gap-2 mb-6">
          {routines.map((routine) => (
            <div key={routine.id} className="fit-card card-enter p-4">
              <p className="section-title">{upper(routine.name)}</p>
              <p className="text-muted text-caption mb-3">
                {routine.items.length} hareket
              </p>
              <Link href={`/routines/${routine.id}/workout`} className="save-btn w-full">
                <Play size={16} /> Antrenmanı Başlat
              </Link>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title mb-2">{upper("Beslenme")}</h2>
      <Link href="/nutrition" className="fit-card flex items-center gap-3 p-4 mb-6">
        <div className="flex-1">
          <p className="font-display text-display-md" style={{ lineHeight: 1 }}>
            {formatNum(kcalLeft)}
          </p>
          <p className="text-muted text-caption">
            kcal kaldı · hedef {formatNum(kcalGoal)}
          </p>
        </div>
        <span className="mini-btn" aria-hidden="true">
          <Plus size={16} />
        </span>
      </Link>

      <h2 className="section-title mb-2">{upper("Son antrenman")}</h2>
      {lastWorkout === null ? (
        <div className="fit-card p-5 text-small text-muted">Henüz antrenman kaydın yok.</div>
      ) : (
        <Link href="/progress" className="fit-card flex items-center gap-3 p-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-small">
              {relativeDayLabel(dateFromISO(lastWorkout.date))}
            </p>
            <p className="text-muted truncate text-caption">
              {lastWorkout.exerciseNames.join(" · ")}
            </p>
          </div>
          <p className="font-display text-display-sm">
            {lastWorkout.totalSets}
          </p>
        </Link>
      )}
    </div>
  );
}
