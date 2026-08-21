"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ExerciseOption = {
  id: string;
  name: string;
  category: string | null;
  equipment: string | null;
};

/** Rutine hareket eklerken kullanılan katalog araması. */
export async function searchExercises(query: string): Promise<ExerciseOption[]> {
  await requireUser();

  const trimmed = query.trim();
  return prisma.exercise.findMany({
    // Ana katalog fedb; eski wger satırları yalnızca mevcut kayıtlarda id
    // üzerinden görünür, aramada çıkmaz (yoksa aynı hareket iki kez listelenir).
    where: {
      source: "fedb",
      ...(trimmed
        ? {
            OR: [
              { name: { contains: trimmed, mode: "insensitive" } },
              { nameEn: { contains: trimmed, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    take: 25,
    select: { id: true, name: true, category: true, equipment: true },
  });
}
