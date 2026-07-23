/**
 * İlk admin hesabını .env'deki ADMIN_USERNAME / ADMIN_PASSWORD ile oluşturur
 * (plan.md §13). Sonraki kullanıcılar uygulama içindeki yönetici ekranından
 * eklenir.
 *
 *   npm run seed:admin
 *
 * Idempotent: hesap zaten varsa şifreye dokunmaz, sadece bilgi verir.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { USERNAME_RULE_TEXT, isValidUsername, normalizeUsername } from "../lib/username";

async function main() {
  const username = normalizeUsername(process.env.ADMIN_USERNAME ?? "");
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!username || !password) {
    throw new Error("ADMIN_USERNAME ve ADMIN_PASSWORD tanımlı olmalı");
  }
  if (!isValidUsername(username)) {
    throw new Error(USERNAME_RULE_TEXT);
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD en az 8 karakter olmalı");
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`"${username}" zaten kayıtlı (rol: ${existing.role}) — değişiklik yapılmadı.`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      username,
      name,
      role: "admin",
      passwordHash: await bcrypt.hash(password, 12),
      // Varsayılan beslenme hedefleri hesapla birlikte oluşturulur
      nutritionGoal: { create: {} },
    },
  });

  console.log(`Admin oluşturuldu: ${user.username}`);
}

main()
  .catch((error) => {
    console.error("create-admin hatası:", error.message ?? error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
