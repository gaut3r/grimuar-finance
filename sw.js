const CACHE_NAME = "grimuar-cache-v4;
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest"
  // сюда можно добавить иконки, если хочешь:
  // "./icons/icon-192.png",
  // "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Простая стратегия: сначала кэш, если нет — сеть
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Игнорируем запросы к chrome-extension и прочему
  if (req.url.startsWith("chrome-extension")) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      });
    })
  );
});



