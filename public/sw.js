/*
 * Kasıtlı olarak dar kapsamlı service worker.
 *
 * NE CACHE'LENİR: yalnızca içeriği hash'li statik varlıklar (/_next/static/),
 * ikonlar ve çevrimdışı bilgi sayfası.
 *
 * NE CACHE'LENMEZ: HTML sayfaları, API yanıtları, oturum çerezleriyle gelen
 * hiçbir şey. Uygulamadaki her sayfa girişe bağlı ve kişisel veri gösteriyor
 * (kilo kayıtları, kalori). Bunları diske yazmak, ortak kullanılan bir
 * telefonda çıkış yapıldıktan sonra bile başkasına görünmesine yol açar.
 * Bu yüzden gezinme istekleri her zaman ağdan gelir; ağ yoksa çevrimdışı
 * sayfası gösterilir.
 */

const VERSION = "v1";
const STATIC_CACHE = `fitness-static-${VERSION}`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll([
        OFFLINE_URL,
        "/icons/icon-192.png",
        "/icons/icon-512.png",
      ]);
      // Yeni sürüm beklemeden devreye girsin
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Eski sürümlerin cache'lerini temizle
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("fitness-static-") && key !== STATIC_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

/** Hash'li ve kişisel veri içermeyen varlıklar */
function isCacheableAsset(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname === "/manifest.webmanifest")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Yazma işlemleri asla araya girilmez
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Statik varlık: önce cache, yoksa ağdan al ve sakla
  if (isCacheableAsset(url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(STATIC_CACHE);
          cache.put(request, response.clone());
        }
        return response;
      })(),
    );
    return;
  }

  // Sayfa gezinmesi: daima ağ. Ağ yoksa çevrimdışı bilgi sayfası.
  // Sayfa içeriği hiçbir koşulda cache'e yazılmaz.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const cache = await caches.open(STATIC_CACHE);
          const offline = await cache.match(OFFLINE_URL);
          return (
            offline ??
            new Response("Çevrimdışısın.", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }
      })(),
    );
    return;
  }

  // Geri kalan her şey (API, server action, veri) doğrudan ağa gider —
  // araya girilmez, kopyası tutulmaz.
});
