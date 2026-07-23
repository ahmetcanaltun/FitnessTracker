/**
 * PWA ikonlarını üretir (plan.md §9 Faz 3).
 *
 *   npx tsx scripts/generate-icons.ts
 *
 * Motif uygulamanın imza öğesi olan yarışma diski: kırmızı daire, içinde
 * beyaz halka. Maskable ikonda Android dairesel/kare maskeler kenardan
 * kırptığı için dolgu daha küçük tutulur (güvenli alan ~%80).
 *
 * sharp zaten Next.js bağımlılığı olarak kurulu; ayrıca paket eklenmedi.
 */
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const RED = "#E8412C";
const BG = "#17181B";

/** @param inset maskable ikonda diskin çevresinde bırakılan güvenli boşluk oranı */
function discSvg(size: number, inset: number): string {
  const c = size / 2;
  const r = c * (1 - inset);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <circle cx="${c}" cy="${c}" r="${r}" fill="${RED}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.78}" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="${r * 0.09}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.30}" fill="${BG}"/>
</svg>`;
}

async function render(name: string, size: number, inset: number) {
  const png = await sharp(Buffer.from(discSvg(size, inset))).png().toBuffer();
  await writeFile(`public/icons/${name}`, png);
  console.log(`  ${name} (${size}x${size}, ${png.length} bayt)`);
}

async function main() {
  await mkdir("public/icons", { recursive: true });
  console.log("PWA ikonları üretiliyor...");

  // Normal ikonlar: disk kenara yakın
  await render("icon-192.png", 192, 0.08);
  await render("icon-512.png", 512, 0.08);
  // Maskable: kırpmaya karşı daha içeride
  await render("icon-192-maskable.png", 192, 0.2);
  await render("icon-512-maskable.png", 512, 0.2);
  // iOS ana ekran ikonu (Safari maskable desteklemiyor)
  await render("apple-touch-icon.png", 180, 0.08);

  console.log("Bitti.");
}

main().catch((error) => {
  console.error("generate-icons hatası:", error);
  process.exitCode = 1;
});
