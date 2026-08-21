import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoutineDetail } from "@/components/routine-detail";
import { MuscleMap } from "@/components/muscle-map";
import { WeekdayPicker } from "@/components/weekday-picker";
import { sessionMuscleVolume } from "@/lib/muscle-map";

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
              primaryMuscles: true,
              secondaryMuscles: true,
            },
          },
        },
      },
    },
  });

  if (!routine) notFound();

  // Bu tek antrenmanın kas dağılımı (gün çarpanı yok — haftalık toplam /routines'te)
  const volume = sessionMuscleVolume(
    routine.items.map((item) => ({
      targetSets: item.targetSets,
      primaryMuscles: item.exercise.primaryMuscles,
      secondaryMuscles: item.exercise.secondaryMuscles,
    })),
  );
  const missingCount = routine.items.filter(
    (item) => item.exercise.primaryMuscles.length === 0,
  ).length;

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

      <WeekdayPicker routineId={routine.id} initial={routine.weekdays} />

      <div className="mb-5">
        <MuscleMap volume={volume} missingCount={missingCount} />
      </div>

      <RoutineDetail
        routineId={routine.id}
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
    </div>
  );
}
