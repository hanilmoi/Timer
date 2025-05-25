const CACHE_NAME = 'my-cache';

const CACHE_ASSETS = [
    '/Timer/',
    '/Timer/index.html',
    '/Timer/stopwatch.html',
    '/Timer/timer.html',
    '/Timer/manifest.json',
    '/Timer/icon-192.png',
    '/Timer/icon-512.png',
    '/Timer/PracticeExamTimer.png', '/Timer/Stopwatch.png', '/Timer/Timer.png',
    '/Timer/Play.png', '/Timer/Stop.png', '/Timer/Reset.png',
    '/Timer/alarm.mp3',
    '/Timer/.nojekyll',
    '/Timer/service-worker.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CACHE_ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    const requestUrl = event.request.url;
    
    if (requestUrl.startsWith('chrome-extension://')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            })
            .catch(() => {
                return caches.match(event.request).then((response) => {
                    return response || new Response('⚠️ 네트워크 오류 & 캐시 없음', { status: 404 });
                });
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cache) => cache !== CACHE_NAME)
                    .map((cache) => caches.delete(cache))
            );
        })
    );
});
