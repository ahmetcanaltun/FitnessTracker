import type { MealType } from "./generated/prisma/enums";

// Enum değerleri ASCII (Postgres enum), ekranda gösterilen etiketler Türkçe.
export const MEAL_TYPES = ["kahvalti", "ogle", "aksam", "atistirmalik"] as const;

export const MEAL_LABELS: Record<MealType, string> = {
  kahvalti: "Kahvaltı",
  ogle: "Öğle Yemeği",
  aksam: "Akşam Yemeği",
  atistirmalik: "Atıştırmalık",
};

