// English Memorize Service Worker
// Strategy: cache-first with runtime caching for mp3/html/js/css/json.
// On install, only the SW shell is registered. Assets are cached as the user accesses them.
const CACHE_NAME = 'english-memorize-v1';

const CACHEABLE_DESTS = ['document', 'script', 'style', 'audio', 'image', 'font'];
const CACHEABLE_EXT = /\.(mp3|json|svg|png|jpg|css|js|html|woff2?)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Only cache same-origin
  if (url.origin !== self.location.origin) return;

  const cacheable =
    CACHEABLE_DESTS.includes(request.destination) ||
    CACHEABLE_EXT.test(url.pathname) ||
    request.mode === 'navigate';
  if (!cacheable) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          if (request.mode === 'navigate') {
            return caches.match('./') || caches.match('./index.html');
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});
