-- Giriş kimliği e-posta yerine kullanıcı adı oldu.
--
-- Sütunu düşürüp yeniden eklemek yerine RENAME kullanıyoruz: mevcut hesaplar
-- (ve şifreleri) korunuyor, e-postanın "@" öncesi kısmı kullanıcı adına dönüşüyor.

ALTER TABLE "users" RENAME COLUMN "email" TO "username";

-- "admin@example.com" -> "admin"
UPDATE "users" SET "username" = split_part("username", '@', 1);

-- Kullanıcı adları küçük harf ASCII olarak saklanır
UPDATE "users" SET "username" = lower("username");

ALTER INDEX "users_email_key" RENAME TO "users_username_key";
