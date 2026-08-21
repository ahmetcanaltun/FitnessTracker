/**
 * vulovix/body-muscles (Apache-2.0) SVG path verisini indirip
 * lib/muscle-shapes.ts dosyasını üretir.
 *
 *   npm run muscle:shapes
 *
 * Çalışma anında dış istek olmaması için veri repoya gömülür. Üretilen dosya
 * elle düzenlenmez.
 */
import { writeFileSync } from "node:fs";

const BASE = "https://raw.githubusercontent.com/vulovix/body-muscles/main/src/data";
const FILES = [
  { url: `${BASE}/muscles.front.ts`, view: "front" as const },
  { url: `${BASE}/muscles.back.ts`, view: "back" as const },
];

// Kütüphane ön ve arka figürü TEK koordinat uzayında yan yana tanımlıyor.
// Kutu, path verisinin ölçülen gerçek sınırlarından (x 0..68.6, y 0..92.6)
// 1.5 birim payla türetildi — kütüphanenin kendi önerdiği kutu üstte %23
// boşluk bırakıyor, altta ayakları kırpıyordu.
const VIEWBOX = "-1.5 -1.5 71.6 95.6";

type Shape = { id: string; view: "front" | "back"; d: string };

async function collect(): Promise<Shape[]> {
  const shapes: Shape[] = [];
  for (const file of FILES) {
    const res = await fetch(file.url);
    if (!res.ok) throw new Error(`${file.url} indirilemedi (${res.status})`);
    const text = await res.text();

    // Kayıtlar { id: "...", name: "...", view: ..., path: "..." } biçiminde.
    for (const block of text.split(/\},\s*\{/)) {
      const id = /id:\s*"([^"]+)"/.exec(block)?.[1];
      const d = /path:\s*"([^"]+)"/.exec(block)?.[1];
      if (id && d) shapes.push({ id, view: file.view, d });
    }
  }
  return shapes;
}

async function main() {
  const shapes = await collect();
  if (shapes.length < 80) {
    throw new Error(
      `Beklenenden az şekil bulundu (${shapes.length}) — ayrıştırma bozulmuş olabilir.`,
    );
  }

  const header = `// ÜRETİLEN DOSYA — elle düzenleme. Yeniden üretmek için: npm run muscle:shapes
//
// Kaynak: https://github.com/vulovix/body-muscles (Apache License 2.0)
// Copyright vulovix. Apache-2.0 şartları gereği bu bildirim korunmalıdır.

export const SHAPE_VIEWBOX = ${JSON.stringify(VIEWBOX)};

export type MuscleShape = { id: string; view: "front" | "back"; d: string };

export const MUSCLE_SHAPES: MuscleShape[] = ${JSON.stringify(shapes, null, 2)};
`;

  writeFileSync("lib/muscle-shapes.ts", header);
  const front = shapes.filter((s) => s.view === "front").length;
  console.log(`${shapes.length} şekil yazıldı (ön ${front}, arka ${shapes.length - front}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
