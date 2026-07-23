"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type FoodOption = {
  id: string;
  name: string;
  brand: string | null;
  unit: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

/**
 * Yerel besin kataloğunda arama (plan.md §6).
 * Faz 3'te bulunamayan ürünler için Open Food Facts canlı araması eklenecek.
 */
export async function searchFoods(query: string): Promise<FoodOption[]> {
  await requireUser();

  const trimmed = query.trim();
  const rows = await prisma.foodItem.findMany({
    where: trimmed
      ? {
          OR: [
            { name: { contains: trimmed, mode: "insensitive" } },
            { nameEn: { contains: trimmed, mode: "insensitive" } },
            { brand: { contains: trimmed, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { name: "asc" },
    take: 30,
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    brand: row.brand,
    unit: row.unit,
    kcal: Number(row.kcalPerUnit),
    protein: Number(row.proteinG),
    carbs: Number(row.carbsG),
    fat: Number(row.fatG),
  }));
}
