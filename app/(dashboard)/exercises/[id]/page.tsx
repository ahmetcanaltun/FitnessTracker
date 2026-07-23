import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNum, plateColor } from "@/lib/design";
import { relativeDayLabel, shortDateLabel, todayISO } from "@/lib/dates";
import { CountUp } from "@/components/count-up";
import { NewEntrySheet } from "@/components/new-entry-sheet";
import { ProgressChart } from "@/components/progress-chart";
import { StatBox } from "@/components/stat-box";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) notFound();

  const entries = await prisma.exerciseEntry.findMany({
    where: { userId: user.id, exerciseId: id },
    orderBy: [{ performedAt: "asc" }, { createdAt: "asc" }],
  });

  const history = entries.map((e) => ({
    id: e.id,
    kg: Number(e.weightKg),
    reps: e.reps,
    sets: e.sets,
    date: e.performedAt,
  }));

  const last = history.at(-1);
  const pr = history.reduce((max, h) => Math.max(max, h.kg), 0);
  const colors = plateColor(last?.kg ?? 0);

  // Grafik son 12 kaydı gösterir — mobilde daha fazlası okunmuyor
  const chartData = history.slice(-12).map((h) => ({
    label: shortDateLabel(h.date),
    kg: h.kg,
  }));

  return (
    <div className="px-5 pt-6 pb-28">
      <Link href="/exercises" className="flex items-center gap-1 mb-6 text-muted">
        <ChevronLeft size={18} />
        <span className="text-sm">Hareketler</span>
      </Link>

      <div className="flex flex-col items-center text-center mb-6 relative">
        {last ? (
          <div className="plate-badge-lg" style={{ background: colors.bg, color: colors.text }}>
            <span className="font-display" style={{ fontSize: "40px", lineHeight: 1 }}>
              <CountUp value={last.kg} />
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", opacity: 0.85 }}>
              KG
            </span>
          </div>
        ) : (
          <div
            className="plate-badge-lg"
            style={{ background: "var(--color-surface-2)", color: "var(--color-muted)" }}
          >
            <span className="font-display" style={{ fontSize: "32px", lineHeight: 1 }}>
              —
            </span>
            <span style={{ fontSize: "10px", letterSpacing: "0.1em" }}>KAYIT YOK</span>
          </div>
        )}

        <h2 className="font-display mt-4" style={{ fontSize: "26px" }}>
          {exercise.name.toUpperCase()}
        </h2>
        <p className="text-sm mt-1 text-muted">
          {[exercise.category, exercise.equipment].filter(Boolean).join(" · ")}
        </p>
        {last && (
          <p className="text-muted" style={{ fontSize: "11px", marginTop: "6px" }}>
            En yakın yarışma diski: {colors.label}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <StatBox label="Rekor (PR)" value={pr > 0 ? `${formatNum(pr)} kg` : "—"} />
        <StatBox label="Son Kayıt" value={last ? relativeDayLabel(last.date) : "—"} />
        <StatBox label="Toplam Kayıt" value={history.length} />
      </div>

      {chartData.length > 1 ? (
        <div className="fit-card p-4 mb-6" style={{ height: "180px" }}>
          <ProgressChart data={chartData} color={colors.bg} />
        </div>
      ) : (
        <div className="fit-card p-6 mb-6 text-center text-muted text-sm">
          {history.length === 0
            ? "İlk kaydını ekleyince ilerleme grafiği burada görünecek."
            : "Grafik için en az iki kayıt gerekiyor."}
        </div>
      )}

      {history.length > 0 && (
        <>
          <h3 className="font-semibold mb-3">Son Kayıtlar</h3>
          <div className="flex flex-col gap-2">
            {[...history].reverse().slice(0, 8).map((h) => (
              <div key={h.id} className="flex items-center justify-between fit-card px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "9999px",
                      background: plateColor(h.kg).bg,
                    }}
                  />
                  <span className="font-mono text-sm">{shortDateLabel(h.date)}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-sm text-muted">
                  <span>
                    {h.sets}x{h.reps}
                  </span>
                  <span style={{ color: "var(--color-ink)", fontWeight: 600 }}>
                    {formatNum(h.kg)} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <NewEntrySheet
        exerciseId={exercise.id}
        exerciseName={exercise.name}
        lastWeight={last?.kg ?? 20}
        today={todayISO()}
      />
    </div>
  );
}
