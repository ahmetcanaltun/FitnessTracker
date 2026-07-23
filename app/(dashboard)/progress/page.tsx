import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlateBadge } from "@/components/plate-badge";

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
      <h1 className="font-display text-2xl mb-1">İLERLEME</h1>
      <p className="text-sm mb-5 text-muted">Tüm hareketlerdeki rekorların</p>

      {records.length === 0 ? (
        <div className="fit-card p-6 text-center text-sm text-muted">
          Henüz kaydın yok. İlk ağırlığını girdiğinde rekorların burada birikmeye başlayacak.
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
