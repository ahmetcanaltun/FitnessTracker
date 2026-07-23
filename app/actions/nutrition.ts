"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dateFromISO } from "@/lib/dates";
import { MEAL_TYPES } from "@/lib/meals";

const mealEntrySchema = z.object({
  foodItemId: z.string().min(1),
  mealType: z.enum(MEAL_TYPES),
  quantity: z.number().positive().max(999),
  loggedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type SaveMealResult = { ok: true } | { ok: false; error: string };

export async function saveMealEntry(input: unknown): Promise<SaveMealResult> {
  const user = await requireUser();

  const parsed = mealEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Girilen değerler geçersiz." };
  }
  const { foodItemId, mealType, quantity, loggedAt } = parsed.data;

  const food = await prisma.foodItem.findUnique({ where: { id: foodItemId } });
  if (!food) {
    return { ok: false, error: "Besin bulunamadı." };
  }

  // Besin değerleri kayıt anında hesaplanıp satıra kopyalanır (plan.md §4):
  // FoodItem ileride düzeltilse bile geçmiş kayıtlar sabit kalır.
  const round = (n: number) => Math.round(n * 100) / 100;

  await prisma.mealEntry.create({
    data: {
      userId: user.id,
      foodItemId,
      mealType,
      quantity,
      kcal: round(Number(food.kcalPerUnit) * quantity),
      proteinG: round(Number(food.proteinG) * quantity),
      carbsG: round(Number(food.carbsG) * quantity),
      fatG: round(Number(food.fatG) * quantity),
      loggedAt: dateFromISO(loggedAt),
    },
  });

  revalidatePath("/nutrition");
  return { ok: true };
}

export async function deleteMealEntry(entryId: string) {
  const user = await requireUser();

  const result = await prisma.mealEntry.deleteMany({
    where: { id: entryId, userId: user.id },
  });

  if (result.count === 0) {
    return { ok: false as const, error: "Kayıt bulunamadı." };
  }

  revalidatePath("/nutrition");
  return { ok: true as const };
}

const waterSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  glassCount: z.number().int().min(0).max(50),
});

export async function setWaterCount(input: unknown) {
  const user = await requireUser();

  const parsed = waterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Geçersiz değer." };
  }
  const { date, glassCount } = parsed.data;

  await prisma.waterEntry.upsert({
    where: { userId_date: { userId: user.id, date: dateFromISO(date) } },
    create: { userId: user.id, date: dateFromISO(date), glassCount },
    update: { glassCount },
  });

  revalidatePath("/nutrition");
  return { ok: true as const };
}

const goalSchema = z.object({
  kcalGoal: z.number().int().min(500).max(10000),
  proteinGoal: z.number().int().min(10).max(500),
  carbsGoal: z.number().int().min(10).max(1000),
  fatGoal: z.number().int().min(10).max(400),
  waterGoalGlasses: z.number().int().min(1).max(30),
});

export async function saveNutritionGoal(input: unknown) {
  const user = await requireUser();

  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Hedef değerleri geçersiz." };
  }

  await prisma.nutritionGoal.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/nutrition");
  revalidatePath("/profile");
  return { ok: true as const };
}
