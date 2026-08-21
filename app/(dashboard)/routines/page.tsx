import Link from "next/link";
import { ChevronRight, ListChecks } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoutineCreateForm } from "@/components/routine-create-form";
import { MuscleSummary } from "@/components/muscle-summary";
import { weeklyMuscleVolume } from "@/lib/muscle-map";

export default async function RoutinesPage() {
  const user = await requireUser();

  const routines = await prisma.routine.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: {
          exercise: {
            select: { name: true, primaryMuscles: true, secondaryMuscles: true },
          },
        },
      },
    },
  });

  // Haftalık toplam: her rutin atandığı gün sayısı kadar sayılır
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

  return (
    <div className="px-5 pt-6 pb-28">
      <h1 className="page-title">RUTİNLER</h1>
      <p className="page-sub mb-5">Sık yaptığın antrenmanları kaydet, sırayla uygula.</p>

      {routines.length === 0 ? (
        <div className="fit-card p-6 text-center text-sm text-muted mb-4">
          Henüz rutinin yok. Aşağıdan ilk rutinini oluştur — örneğin
          &quot;İtiş Günü&quot; ya da &quot;Bacak&quot;.
        </div>
      ) : (
        <div className="flex flex-col gap-2 mb-5">
          {routines.map((routine, i) => (
            <Link
              key={routine.id}
              href={`/routines/${routine.id}`}
              className="fit-card card-enter flex items-center gap-3 p-4"
              style={{ animationDelay: `${Math.min(i, 10) * 60}ms` }}
            >
              <div
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "var(--color-surface-2)",
                }}
              >
                <ListChecks size={18} style={{ color: "var(--color-plate-green)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ fontSize: "15px" }}>
                  {routine.name}
                </p>
                <p className="text-muted truncate" style={{ fontSize: "11px" }}>
                  {routine.items.length === 0
                    ? "Hareket eklenmemiş"
                    : `${routine.items.length} hareket · ${routine.items
                        .slice(0, 3)
                        .map((item) => item.exercise.name)
                        .join(", ")}${routine.items.length > 3 ? "..." : ""}`}
                </p>
              </div>
              <ChevronRight size={18} style={{ color: "var(--color-muted)" }} />
            </Link>
          ))}
        </div>
      )}

      {routines.length > 0 && (
        <div className="mb-5">
          <MuscleSummary volume={weekly} />
        </div>
      )}

      <RoutineCreateForm />
    </div>
  );
}
