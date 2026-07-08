/// Frame Hub Service Worker
/// v7: new frame hub brand icon + OG artwork. Icons only — never cache HTML or /_next.

const CACHE_NAME = "framehub-v7";

const PRECACHE_URLS = [
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/maskable-192x192.png",
  "/icons/maskable-512x512.png",
  "/og-image.png",
  "/favicon.ico",
];

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
