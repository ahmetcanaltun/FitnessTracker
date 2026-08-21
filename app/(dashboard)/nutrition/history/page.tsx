import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dateFromISO, todayISO, toISODate } from "@/lib/dates";
import { formatNum } from "@/lib/design";
import { StatBox } from "@/components/stat-box";
import { KcalChart, MacroChart } from "@/components/nutrition-history-chart";
import {
  summarize,
  toDailyBuckets,
  toWeeklyBuckets,
  type DayTotals,
} from "@/lib/nutrition-history";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const DAILY_DAYS = 14;
const WEEKLY_WEEKS = 8;

export default async function NutritionHistoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const mode = (Array.isArray(sp.gorunum) ? sp.gorunum[0] : sp.gorunum) === "haftalik"
    ? "haftalik"
    : "gunluk";

  const today = dateFromISO(todayISO());
  const spanDays = mode === "haftalik" ? WEEKLY_WEEKS * 7 : DAILY_DAYS;
  const since = new Date(today);
  since.setUTCDate(since.getUTCDate() - (spanDays - 1));

  const [rows, goal] = await Promise.all([
    prisma.mealEntry.groupBy({
      by: ["loggedAt"],
      where: { userId: user.id, loggedAt: { gte: since, lte: today } },
      _sum: { kcal: true, proteinG: true, carbsG: true, fatG: true },
    }),
    prisma.nutritionGoal.findUnique({ where: { userId: user.id } }),
  ]);

  const totals: DayTotals[] = rows.map((row) => ({
    date: toISODate(row.loggedAt),
    kcal: Number(row._sum.kcal ?? 0),
    protein: Number(row._sum.proteinG ?? 0),
    carbs: Number(row._sum.carbsG ?? 0),
    fat: Number(row._sum.fatG ?? 0),
  }));

  const kcalGoal = goal?.kcalGoal ?? 2600;
  const proteinGoal = goal?.proteinGoal ?? 180;

  const buckets =
    mode === "haftalik"
      ? toWeeklyBuckets(totals, WEEKLY_WEEKS, today)
      : toDailyBuckets(totals, DAILY_DAYS, today);

  const stats = summarize(buckets, kcalGoal);
  const hasData = totals.length > 0;

  return (
    <div className="px-5 pt-6 pb-28">
      <Link href="/nutrition" className="flex items-center gap-1 mb-6 text-muted">
        <ChevronLeft size={18} />
        <span className="text-sm">Beslenme</span>
      </Link>

      <h1 className="page-title">GEÇMİŞ</h1>
      <p className="page-sub mb-5">
        {mode === "haftalik"
          ? `Son ${WEEKLY_WEEKS} hafta — günlük ortalama`
          : `Son ${DAILY_DAYS} gün`}
      </p>

      <div className="flex gap-2 mb-5">
        <Link
          href="/nutrition/history"
          className="fit-chip"
          data-active={mode === "gunluk"}
        >
          Günlük
        </Link>
        <Link
          href="/nutrition/history?gorunum=haftalik"
          className="fit-chip"
          data-active={mode === "haftalik"}
        >
          Haftalık
        </Link>
      </div>

      {!hasData ? (
        <div className="fit-card p-6 text-center text-sm text-muted">
          Bu aralıkta beslenme kaydın yok. Öğün eklemeye başlayınca trend burada
          birikecek.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-5">
            <StatBox
              label={mode === "haftalik" ? "Ort. kalori" : "Günlük ort."}
              value={`${formatNum(stats.avgKcal)}`}
            />
            <StatBox label="Ort. protein" value={`${formatNum(stats.avgProtein)} g`} />
            <StatBox
              label="Hedefi tutturma"
              value={`${stats.onTargetDays}/${stats.activeDays}`}
            />
          </div>

          <p className="field-label">KALORİ</p>
          <div className="fit-card p-4 mb-5" style={{ height: "190px" }}>
            <KcalChart data={buckets} goal={kcalGoal} />
          </div>

          <p className="field-label">MAKROLAR (g)</p>
          <div className="fit-card p-4 mb-4" style={{ height: "210px" }}>
            <MacroChart data={buckets} />
          </div>

          <p className="text-muted" style={{ fontSize: "11px" }}>
            Protein hedefi {proteinGoal} g. Kayıt girilmemiş günler grafikte sıfır
            görünür{mode === "haftalik" && ", haftalık ortalama 7 güne bölünür"}.
          </p>
        </>
      )}
    </div>
  );
}
