/// Frame Hub Service Worker
/// v2: Do not precache or cache HTML /_next assets — stale shells caused ChunkLoadError after deploys.

const CACHE_NAME = "framehub-v2";

const PRECACHE_URLS = ["/icons/icon-192x192.png", "/icons/icon-512x512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Next.js hashed chunks & RSC — never intercept; avoids stale chunk refs after redeploys
  if (url.pathname.startsWith("/_next/")) return;

  if (url.pathname.startsWith("/api/")) return;

  // PWA icons & game images: cache-first offline support
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML & any remaining routes: network only (no SW cache of documents or JS)
  event.respondWith(fetch(request));
});
