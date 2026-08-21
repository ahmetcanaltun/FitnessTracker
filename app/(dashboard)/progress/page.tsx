import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlateBadge } from "@/components/plate-badge";
import { WorkoutHistoryList } from "@/components/workout-history-list";
import { MuscleMap } from "@/components/muscle-map";
import { weeklyMuscleVolume } from "@/lib/muscle-map";
import { groupWorkoutDays } from "@/lib/workout-history";
import { toISODate } from "@/lib/dates";
import { upper } from "@/lib/design";

export default async function ProgressPage() {
  const user = await requireUser();

  // Her hareket için kişisel rekor = o hareketteki en yüksek ağırlık
  const groups = await prisma.exerciseEntry.groupBy({
    by: ["exerciseId"],
    where: { userId: user.id },
    _max: { weightKg: true },
  });

  const exercises = groups.length
    ? await prisma.exercise.findMany({
        where: { id: { in: groups.map((g) => g.exerciseId) } },
        select: { id: true, name: true, category: true },
      })
    : [];

  const byId = new Map(exercises.map((e) => [e.id, e]));

  const recent = await prisma.exerciseEntry.findMany({
    where: { userId: user.id },
    orderBy: [{ performedAt: "desc" }, { createdAt: "desc" }],
    take: 200,
    select: {
      performedAt: true,
      sets: true,
      reps: true,
      weightKg: true,
      exercise: { select: { name: true } },
    },
  });

  const routines = await prisma.routine.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          exercise: { select: { primaryMuscles: true, secondaryMuscles: true } },
        },
      },
    },
  });

  const weekly = weeklyMuscleVolume(
    routines.map((routine) => ({
      weekdays: routine.weekdays,
      items: routine.items.map((item) => ({
        targetSets: item.targetSets,
        primaryMuscles: item.exercise.primaryMuscles,
        secondaryMuscles: item.exercise.secondaryMuscles,
      })),
    })),
  );

  const days = groupWorkoutDays(
    recent.map((entry) => ({
      performedAt: toISODate(entry.performedAt),
      exerciseName: entry.exercise.name,
      sets: entry.sets,
      reps: entry.reps,
      weightKg: Number(entry.weightKg),
    })),
  ).slice(0, 10);

  const records = groups
    .map((group) => ({
      exercise: byId.get(group.exerciseId),
      pr: Number(group._max.weightKg ?? 0),
    }))
    .filter((r): r is { exercise: NonNullable<typeof r.exercise>; pr: number } =>
      Boolean(r.exercise),
    )
    .sort((a, b) => b.pr - a.pr);

  return (
    <div className="px-5 pt-6 pb-28">
      <h1 className="page-title">İLERLEME</h1>
      <p className="page-sub mb-5">Haftalık dağılımın, son antrenmanların ve rekorların</p>

      <h2 className="section-title mb-2">{upper("Haftalık kas dağılımı")}</h2>
      <div className="mb-6">
        <MuscleMap volume={weekly} />
      </div>

      <h2 className="section-title mb-2">{upper("Son antrenmanlar")}</h2>
      <div className="mb-6">
        <WorkoutHistoryList days={days} />
      </div>

      <h2 className="section-title mb-2">{upper("Rekorlar")}</h2>
      {records.length === 0 ? (
        <div className="fit-card p-6 text-center text-small text-muted">
          <p>Henüz kaydın yok. İlk ağırlığını girdiğinde rekorların burada birikir.</p>
          <Link
            href="/exercises"
            className="inline-block mt-3"
            style={{ color: "var(--color-plate-blue)" }}
          >
            Hareket seç
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {records.map((record, i) => (
            <Link
              key={record.exercise.id}
              href={`/exercises/${record.exercise.id}`}
              className="fit-card p-4 flex flex-col items-center text-center card-enter"
              style={{ animationDelay: `${Math.min(i, 12) * 60}ms` }}
            >
              <PlateBadge kg={record.pr} className="mb-2" />
              <span className="text-sm font-medium">{record.exercise.name}</span>
              {record.exercise.category && (
                <span className="text-muted" style={{ fontSize: "11px" }}>
                  {record.exercise.category}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
