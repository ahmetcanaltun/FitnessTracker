/**
 * Open Food Facts istemcisi (plan.md §6, Faz 3).
 *
 * Yalnızca kullanıcı "internette ara" dediğinde çağrılır. Çekirdek besin
 * listesi ve daha önce içe aktarılmış ürünler yerel tabloda arandığı için
 * normal akışta dış istek yok.
 *
 * Veri lisansı: ODbL (plan.md §13).
 */

// Birincil arama: Search-a-licious. Eski `cgi/search.pl` ölçümde üç istekten
// birinde 503 döndüğü için yedeğe alındı — kullanıcıya dönük aramada
// kabul edilemez bir hata oranı.
const SEARCH_URL = "https://search.openfoodfacts.org/search";
const LEGACY_SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl";

// OFF dokümantasyonu tanımlayıcı bir User-Agent istiyor
const USER_AGENT = "fitness-track-app/0.1 (self-hosted personal tracker)";

const FIELDS = [
  "code",
  "product_name",
  "product_name_tr",
  "brands",
  "nutriments",
].join(",");

export type OffProduct = {
  code: string;
  name: string;
  brand: string | null;
  /** Değerler 100 g başına */
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

type RawProduct = {
  code?: string;
  product_name?: string;
  product_name_tr?: string;
  // İki uç nokta farklı tip döndürüyor: eski API virgülle ayrılmış metin
  // ("Ülker,Eti"), Search-a-licious ise dizi (["Ülker"]).
  brands?: string | string[];
  nutriments?: Record<string, unknown>;
};

function num(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : null;
}

/** Ondalık gürültüsünü kırp: 64.2857125 -> 64.29 */
function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** İlk markayı döndürür; hem dizi hem virgüllü metin biçimini kabul eder. */
function firstBrand(brands: string | string[] | undefined): string | null {
  if (!brands) return null;
  const first = Array.isArray(brands) ? brands[0] : brands.split(",")[0];
  return first?.trim() || null;
}

/**
 * Ham OFF kaydını normalize eder.
 *
 * Kalorisi olmayan ürünler `null` döner ve listeye hiç girmez — OFF'ta besin
 * değeri boş bırakılmış çok sayıda kayıt var, bunları eklemek kullanıcıya
 * 0 kalorili sahte kayıt olarak geri döner.
 */
function normalizeProduct(raw: RawProduct): OffProduct | null {
  const code = raw.code?.trim();
  if (!code) return null;

  const name = (raw.product_name_tr || raw.product_name || "").trim();
  if (!name) return null;

  const n = raw.nutriments ?? {};
  const kcal = num(n["energy-kcal_100g"]);
  if (kcal === null || kcal === 0) return null;

  return {
    code,
    name,
    brand: firstBrand(raw.brands),
    kcal: round(kcal),
    protein: round(num(n["proteins_100g"]) ?? 0),
    carbs: round(num(n["carbohydrates_100g"]) ?? 0),
    fat: round(num(n["fat_100g"]) ?? 0),
  };
}

async function offFetch(url: string): Promise<unknown> {
  // Dış servis yavaşlarsa arama kutusu kilitlenmesin
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Open Food Facts yanıt vermedi (${res.status})`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

/** Ham listeyi normalize edip kopyaları ve besin değeri olmayanları ayıklar. */
function collect(raws: RawProduct[], limit: number): OffProduct[] {
  const seen = new Set<string>();
  const results: OffProduct[] = [];

  for (const raw of raws) {
    const product = normalizeProduct(raw);
    if (!product || seen.has(product.code)) continue;
    seen.add(product.code);
    results.push(product);
    if (results.length >= limit) break;
  }

  return results;
}

async function searchViaSearchalicious(query: string, limit: number) {
  const params = new URLSearchParams({
    q: query,
    page_size: String(Math.min(limit * 2, 40)),
  });
  // Search-a-licious sonuçları `hits` altında döner; alan adları
  // (product_name, nutriments...) eski API ile aynı.
  const data = (await offFetch(`${SEARCH_URL}?${params}`)) as { hits?: RawProduct[] };
  return collect(data.hits ?? [], limit);
}

async function searchViaLegacy(query: string, limit: number) {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: String(Math.min(limit * 2, 40)),
    fields: FIELDS,
  });
  const data = (await offFetch(`${LEGACY_SEARCH_URL}?${params}`)) as { products?: RawProduct[] };
  return collect(data.products ?? [], limit);
}

export async function searchProducts(query: string, limit = 15): Promise<OffProduct[]> {
  try {
    return await searchViaSearchalicious(query, limit);
  } catch (error) {
    // Sessizce yutma: bir kez birincil uç noktadaki alan tipi değişikliği
    // (brands dizi oldu) burada gizlenip her aramayı güvenilmez eski
    // uç noktaya düşürmüştü. Log olmadan fark edilmesi zor.
    console.warn("Open Food Facts birincil arama başarısız, eskisine düşülüyor:", error);
    // Yedek de düşerse hata yukarı çıkar, kullanıcı "ulaşılamıyor" görür.
    return await searchViaLegacy(query, limit);
  }
}

