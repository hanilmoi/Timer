const CACHE_NAME = 'my-cache-v1';

const CACHE_ASSETS = [
  '/Timer/',
  '/Timer/index.html',
  '/Timer/stopwatch.html',
  '/Timer/timer.html',
  '/Timer/manifest.json',
  '/Timer/icon-192.png',
  '/Timer/icon-512.png',
  '/Timer/PracticeExamTimer.png',
  '/Timer/Stopwatch.png',
  '/Timer/Timer.png',
  '/Timer/Play.png',
  '/Timer/Stop.png',
  '/Timer/Reset.png',
  '/Timer/.nojekyll',
  '/Timer/service-worker.js'/
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      );
    })
  );
});
