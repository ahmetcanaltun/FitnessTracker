"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  USERNAME_PATTERN,
  USERNAME_RULE_TEXT,
  isValidUsername,
  normalizeUsername,
} from "@/lib/username";

// Kayıt herkese açık değil: kullanıcılar sadece buradan eklenir (plan.md §13).

const createUserSchema = z.object({
  name: z.string().min(1).max(60),
  username: z.string().regex(USERNAME_PATTERN),
  password: z.string().min(8).max(200),
  role: z.enum(["member", "admin"]),
});

export type CreateUserState = { error: string | null; success: string | null };

export async function createUser(
  _prev: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const username = normalizeUsername(String(formData.get("username") ?? ""));

  const parsed = createUserSchema.safeParse({
    name,
    username,
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "member"),
  });

  if (!parsed.success) {
    // Hangi alanın hatalı olduğunu ayırt et: kullanıcı adı kuralları özel
    if (!name) {
      return { error: "Ad gerekli.", success: null };
    }
    if (!isValidUsername(username)) {
      return { error: USERNAME_RULE_TEXT, success: null };
    }
    return { error: "Şifre en az 8 karakter olmalı.", success: null };
  }

  const existing = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (existing) {
    return { error: "Bu kullanıcı adı zaten alınmış.", success: null };
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      username: parsed.data.username,
      role: parsed.data.role,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      nutritionGoal: { create: {} },
    },
  });

  revalidatePath("/admin/users");
  return { error: null, success: `${parsed.data.name} eklendi.` };
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();

  if (admin.id === userId) {
    return { ok: false as const, error: "Kendi hesabını silemezsin." };
  }

  // Son admin silinirse sisteme kimse kullanıcı ekleyemez hale gelir
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return { ok: false as const, error: "Kullanıcı bulunamadı." };
  }
  if (target.role === "admin") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      return { ok: false as const, error: "Son yönetici hesabı silinemez." };
    }
  }

  // Kayıtlar onDelete: Cascade ile birlikte silinir
  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/users");
  return { ok: true as const };
}
