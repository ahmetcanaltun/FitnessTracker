import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoutineDetail } from "@/components/routine-detail";
import { WeekdayPicker } from "@/components/weekday-picker";

export default async function RoutineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  // userId filtresi: başkasının rutini 404 döner, "yetkisiz" bile demez
  const routine = await prisma.routine.findFirst({
    where: { id, userId: user.id },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: {
          exercise: {
            select: {
              id: true,
              name: true,
              category: true,
              equipment: true,
            },
          },
        },
      },
    },
  });

  if (!routine) notFound();

  // Hedef ağırlık girilmemiş hareketler için son kaydı öneri olarak göster
  const exerciseIds = routine.items.map((item) => item.exercise.id);
  const lastEntries = exerciseIds.length
    ? await prisma.exerciseEntry.findMany({
        where: { userId: user.id, exerciseId: { in: exerciseIds } },
        orderBy: { performedAt: "desc" },
        distinct: ["exerciseId"],
        select: { exerciseId: true, weightKg: true },
      })
    : [];

  const lastByExercise = new Map(
    lastEntries.map((entry) => [entry.exerciseId, Number(entry.weightKg)]),
  );

  return (
    <div className="px-5 pt-6 pb-28">
      <Link href="/routines" className="flex items-center gap-1 mb-6 text-muted">
        <ChevronLeft size={18} />
        <span className="text-sm">Rutinler</span>
      </Link>

      <RoutineDetail
        routineId={routine.id}
        startHref={`/routines/${routine.id}/workout`}
        name={routine.name}
        notes={routine.notes}
        items={routine.items.map((item) => ({
          id: item.id,
          exerciseId: item.exercise.id,
          exerciseName: item.exercise.name,
          category: item.exercise.category,
          targetSets: item.targetSets,
          targetReps: item.targetReps,
          targetWeightKg: item.targetWeightKg === null ? null : Number(item.targetWeightKg),
          lastWeightKg: lastByExercise.get(item.exercise.id) ?? null,
        }))}
      />

      <WeekdayPicker routineId={routine.id} initial={routine.weekdays} />
    </div>
  );
}
