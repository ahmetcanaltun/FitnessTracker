"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchProducts, type OffProduct } from "@/lib/openfoodfacts";

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

export type OnlineResult =
  | { ok: true; products: OffProduct[] }
  | { ok: false; error: string };

/**
 * Open Food Facts'te canlı arama (Faz 3). Yerel katalogda bulunamayan
 * paketli ürünler için. Sonuçlar henüz veritabanına yazılmaz — kullanıcı
 * seçince importFood() ile aktarılır.
 */
export async function searchOnline(query: string): Promise<OnlineResult> {
  await requireUser();

  const trimmed = query.trim();
  if (trimmed.length < 3) {
    return { ok: false, error: "En az 3 harf yaz." };
  }

  try {
    const products = await searchProducts(trimmed);
    if (products.length === 0) {
      return { ok: false, error: "Bu isimde besin değeri kayıtlı ürün bulunamadı." };
    }
    return { ok: true, products };
  } catch {
    // Dış servis hatası kullanıcının akışını kırmasın
    return { ok: false, error: "Open Food Facts'e şu an ulaşılamıyor." };
  }
}

/**
 * Seçilen OFF ürününü yerel `FoodItem` tablosuna aktarır ve kaydı döner.
 *
 * `[source, externalId]` benzersiz olduğu için aynı barkod ikinci kez
 * aktarılırsa kopya oluşmaz, mevcut kayıt güncellenir.
 */
export async function importFood(product: OffProduct): Promise<FoodOption> {
  await requireUser();

  const data = {
    name: product.brand ? `${product.name} (${product.brand})` : product.name,
    brand: product.brand,
    // OFF besin değerleri 100 g başına verilir
    unit: "100g",
    kcalPerUnit: product.kcal,
    proteinG: product.protein,
    carbsG: product.carbs,
    fatG: product.fat,
  };

  const row = await prisma.foodItem.upsert({
    where: { source_externalId: { source: "openfoodfacts", externalId: product.code } },
    create: { ...data, source: "openfoodfacts", externalId: product.code },
    update: data,
  });

  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    unit: row.unit,
    kcal: Number(row.kcalPerUnit),
    protein: Number(row.proteinG),
    carbs: Number(row.carbsG),
    fat: Number(row.fatG),
  };
}
