import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dateFromISO, todayISO } from "@/lib/dates";
import { formatNum } from "@/lib/design";
import { NutritionView, type MealEntryView } from "@/components/nutrition-view";
import { searchFoods } from "@/app/actions/foods";

export default async function NutritionPage() {
  const user = await requireUser();
  const day = todayISO();
  const date = dateFromISO(day);

  const [goal, entries, water, initialFoods] = await Promise.all([
    prisma.nutritionGoal.findUnique({ where: { userId: user.id } }),
    prisma.mealEntry.findMany({
      where: { userId: user.id, loggedAt: date },
      include: { foodItem: { select: { name: true, unit: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.waterEntry.findUnique({
      where: { userId_date: { userId: user.id, date } },
    }),
    searchFoods(""),
  ]);

  const view: MealEntryView[] = entries.map((entry) => ({
    id: entry.id,
    mealType: entry.mealType,
    name: entry.foodItem.name,
    portion: `${formatNum(Number(entry.quantity))} ${entry.foodItem.unit}`,
    kcal: Number(entry.kcal),
    protein: Number(entry.proteinG),
    carbs: Number(entry.carbsG),
    fat: Number(entry.fatG),
  }));

  // Hedef kaydı yoksa şemadaki varsayılanlarla göster
  const goals = {
    kcal: goal?.kcalGoal ?? 2600,
    protein: goal?.proteinGoal ?? 180,
    carbs: goal?.carbsGoal ?? 280,
    fat: goal?.fatGoal ?? 80,
    water: goal?.waterGoalGlasses ?? 8,
  };

  return (
    <NutritionView
      entries={view}
      goals={goals}
      waterGlasses={water?.glassCount ?? 0}
      initialFoods={initialFoods}
      loggedAt={day}
    />
  );
}
