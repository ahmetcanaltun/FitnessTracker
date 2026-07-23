/**
 * Çekirdek besin listesini `FoodItem` tablosuna yazar (plan.md §6).
 *
 *   npm run seed:foods
 *
 * `externalId` = "core:<slug>" olduğu için upsert idempotent: tekrar
 * çalıştırmak mevcut kayıtları günceller, kopya oluşturmaz.
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { CORE_FOODS } from "./core-foods";

async function main() {
  console.log(`${CORE_FOODS.length} çekirdek besin yazılıyor...`);

  for (const food of CORE_FOODS) {
    const externalId = `core:${food.slug}`;
    const data = {
      name: food.name,
      nameEn: food.nameEn,
      unit: food.unit,
      kcalPerUnit: food.kcal,
      proteinG: food.protein,
      carbsG: food.carbs,
      fatG: food.fat,
    };

    await prisma.foodItem.upsert({
      where: { source_externalId: { source: "manual", externalId } },
      create: { ...data, source: "manual", externalId },
      update: data,
    });
  }

  const total = await prisma.foodItem.count();
  console.log(`Bitti. Tabloda toplam ${total} besin var.`);
}

main()
  .catch((error) => {
    console.error("seed-food-items hatası:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
