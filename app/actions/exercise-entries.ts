"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dateFromISO } from "@/lib/dates";

const entrySchema = z.object({
  exerciseId: z.string().min(1),
  weightKg: z.number().min(0).max(999),
  reps: z.number().int().min(1).max(999),
  sets: z.number().int().min(1).max(99),
  performedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rpe: z.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().max(500).optional(),
});

export type SaveEntryResult =
  | { ok: true; isNewPr: boolean }
  | { ok: false; error: string };

export async function saveExerciseEntry(input: unknown): Promise<SaveEntryResult> {
  const user = await requireUser();

  const parsed = entrySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Girilen değerler geçersiz." };
  }
  const { exerciseId, weightKg, reps, sets, performedAt, notes, rpe } = parsed.data;

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    select: { id: true },
  });
  if (!exercise) {
    return { ok: false, error: "Hareket bulunamadı." };
  }

  // PR kontrolü kayıt *eklenmeden önce* yapılır: mevcut en yüksek ağırlık
  const previousBest = await prisma.exerciseEntry.aggregate({
    where: { userId: user.id, exerciseId },
    _max: { weightKg: true },
  });
  const best = previousBest._max.weightKg ? Number(previousBest._max.weightKg) : 0;
  const isNewPr = weightKg > best;

  await prisma.exerciseEntry.create({
    data: {
      userId: user.id,
      exerciseId,
      weightKg,
      reps,
      sets,
      performedAt: dateFromISO(performedAt),
      rpe: rpe ?? null,
      notes: notes?.trim() || null,
    },
  });

  revalidatePath("/exercises");
  revalidatePath(`/exercises/${exerciseId}`);
  revalidatePath("/progress");
  revalidatePath("/profile");

  return { ok: true, isNewPr };
}


