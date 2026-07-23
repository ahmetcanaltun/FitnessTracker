/**
 * Kullanıcı adı kuralları.
 *
 * Neden sadece ASCII: JavaScript'te "İ".toLowerCase() birleşik bir karakter
 * ("i" + combining dot) üretir, Postgres'in lower() fonksiyonu ise farklı
 * davranır. Türkçe karaktere izin verilirse aynı kullanıcı adı iki farklı
 * biçimde saklanabilir ve giriş bazen çalışmaz. Görünen ad (`name`) alanında
 * Türkçe karakter serbest — kısıt yalnızca giriş kimliği için.
 */

// 2-30 karakter; başı ve sonu harf/rakam, arada nokta-tire-alt çizgi serbest.
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{0,28}[a-z0-9]$/;

export const USERNAME_RULE_TEXT =
  "Kullanıcı adı 2-30 karakter olmalı; sadece küçük harf (a-z), rakam, nokta, tire ve alt çizgi kullanılabilir.";

/** Girdiyi saklanacak/karşılaştırılacak biçime çevirir. */
export function normalizeUsername(value: string): string {
  // toLowerCase yerine karakter karakter ASCII dönüşümü: Türkçe "İ" gibi
  // harflerin beklenmedik biçimlere açılmasını engeller.
  return value
    .trim()
    .replace(/[A-Z]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 32));
}

export function isValidUsername(value: string): boolean {
  return USERNAME_PATTERN.test(value);
}
