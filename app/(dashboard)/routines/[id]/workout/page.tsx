import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkoutRunner, type WorkoutItem } from "@/components/workout-runner";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  // userId filtresi: başkasının rutini 404
  const routine = await prisma.routine.findFirst({
    where: { id, userId: user.id },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: { exercise: { select: { id: true, name: true } } },
      },
    },
  });

  if (!routine) notFound();

  // Hedef ağırlığı olmayan hareketler için son kaydı öneri olarak getir
  const exerciseIds = routine.items.map((item) => item.exercise.id);
  const lastEntries = exerciseIds.length
    ? await prisma.exerciseEntry.findMany({
        where: { userId: user.id, exerciseId: { in: exerciseIds } },
        orderBy: [{ performedAt: "desc" }, { createdAt: "desc" }],
        distinct: ["exerciseId"],
        select: { exerciseId: true, weightKg: true },
      })
    : [];
  const lastByExercise = new Map(
    lastEntries.map((entry) => [entry.exerciseId, Number(entry.weightKg)]),
  );

  const items: WorkoutItem[] = routine.items.map((item) => ({
    exerciseId: item.exercise.id,
    name: item.exercise.name,
    targetSets: item.targetSets,
    targetReps: item.targetReps,
    targetWeightKg: item.targetWeightKg === null ? null : Number(item.targetWeightKg),
    lastWeightKg: lastByExercise.get(item.exercise.id) ?? null,
  }));

  return (
    <div className="px-5 pt-6 pb-28">
      <Link href={`/routines/${routine.id}`} className="flex items-center gap-1 mb-6 text-muted">
        <ChevronLeft size={18} />
        <span className="text-sm">Rutin</span>
      </Link>

      {items.length === 0 ? (
        <div className="fit-card p-6 text-center text-sm text-muted">
          Bu rutinde hareket yok. Önce rutine hareket ekle.
        </div>
      ) : (
        <WorkoutRunner routineId={routine.id} routineName={routine.name} items={items} />
      )}
    </div>
  );
}
