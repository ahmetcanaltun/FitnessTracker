"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Rutinler kullanıcıya özel (plan.md §9 Faz 4). Tüm sorgular userId ile
// filtrelenir; başkasının rutinine erişim mümkün değil.

const createSchema = z.object({
  name: z.string().min(1).max(60),
  notes: z.string().max(500).optional(),
});

export async function createRoutine(_prev: unknown, formData: FormData) {
  const user = await requireUser();

  const parsed = createSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    return { error: "Rutin adı gerekli (en fazla 60 karakter).", createdId: null };
  }

  const routine = await prisma.routine.create({
    data: { userId: user.id, name: parsed.data.name, notes: parsed.data.notes ?? null },
  });

  revalidatePath("/routines");
  return { error: null, createdId: routine.id };
}

export async function deleteRoutine(routineId: string) {
  const user = await requireUser();

  const result = await prisma.routine.deleteMany({
    where: { id: routineId, userId: user.id },
  });
  if (result.count === 0) {
    return { ok: false as const, error: "Rutin bulunamadı." };
  }

  revalidatePath("/routines");
  return { ok: true as const };
}

const addItemSchema = z.object({
  routineId: z.string().min(1),
  exerciseId: z.string().min(1),
  targetSets: z.number().int().min(1).max(99).nullable(),
  targetReps: z.number().int().min(1).max(999).nullable(),
  targetWeightKg: z.number().min(0).max(999).nullable(),
});

export async function addRoutineItem(input: unknown) {
  const user = await requireUser();

  const parsed = addItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Geçersiz değerler." };
  }

  // Rutin bu kullanıcıya mı ait
  const routine = await prisma.routine.findFirst({
    where: { id: parsed.data.routineId, userId: user.id },
    select: { id: true },
  });
  if (!routine) {
    return { ok: false as const, error: "Rutin bulunamadı." };
  }

  const exercise = await prisma.exercise.findUnique({
    where: { id: parsed.data.exerciseId },
    select: { id: true },
  });
  if (!exercise) {
    return { ok: false as const, error: "Hareket bulunamadı." };
  }

  // Sıra numarası mevcut son elemanın bir fazlası
  const last = await prisma.routineItem.findFirst({
    where: { routineId: routine.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await prisma.routineItem.create({
    data: {
      routineId: routine.id,
      exerciseId: parsed.data.exerciseId,
      position: (last?.position ?? -1) + 1,
      targetSets: parsed.data.targetSets,
      targetReps: parsed.data.targetReps,
      targetWeightKg: parsed.data.targetWeightKg,
    },
  });

  revalidatePath(`/routines/${routine.id}`);
  return { ok: true as const };
}

export async function removeRoutineItem(itemId: string) {
  const user = await requireUser();

  // Sahiplik iç içe ilişki üzerinden doğrulanır
  const item = await prisma.routineItem.findFirst({
    where: { id: itemId, routine: { userId: user.id } },
    select: { id: true, routineId: true },
  });
  if (!item) {
    return { ok: false as const, error: "Kayıt bulunamadı." };
  }

  await prisma.routineItem.delete({ where: { id: item.id } });

  revalidatePath(`/routines/${item.routineId}`);
  return { ok: true as const };
}

/** Sıralamayı bir adım yukarı/aşağı taşır. */
export async function moveRoutineItem(itemId: string, direction: "up" | "down") {
  const user = await requireUser();

  const item = await prisma.routineItem.findFirst({
    where: { id: itemId, routine: { userId: user.id } },
    select: { id: true, routineId: true, position: true },
  });
  if (!item) {
    return { ok: false as const, error: "Kayıt bulunamadı." };
  }

  const neighbour = await prisma.routineItem.findFirst({
    where: {
      routineId: item.routineId,
      position: direction === "up" ? { lt: item.position } : { gt: item.position },
    },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
    select: { id: true, position: true },
  });

  // Zaten uçtaysa sessizce çık
  if (!neighbour) {
    return { ok: true as const };
  }

  // İki güncelleme tek işlemde: yarıda kalırsa sıra bozulmasın
  await prisma.$transaction([
    prisma.routineItem.update({ where: { id: item.id }, data: { position: neighbour.position } }),
    prisma.routineItem.update({ where: { id: neighbour.id }, data: { position: item.position } }),
  ]);

  revalidatePath(`/routines/${item.routineId}`);
  return { ok: true as const };
}

const weekdaysSchema = z.array(z.number().int().min(1).max(7)).max(7);

/** Rutinin haftanın hangi günlerinde yapıldığı — haftalık kas hesabının çarpanı. */
export async function updateRoutineWeekdays(routineId: string, weekdays: number[]) {
  const user = await requireUser();

  const parsed = weekdaysSchema.safeParse(weekdays);
  if (!parsed.success) {
    return { ok: false as const, error: "Geçersiz gün seçimi." };
  }

  // userId ile daraltma: başkasının rutini güncellenemez
  const result = await prisma.routine.updateMany({
    where: { id: routineId, userId: user.id },
    data: { weekdays: [...new Set(parsed.data)].sort((a, b) => a - b) },
  });
  if (result.count === 0) {
    return { ok: false as const, error: "Rutin bulunamadı." };
  }

  revalidatePath(`/routines/${routineId}`);
  revalidatePath("/routines");
  return { ok: true as const };
}
