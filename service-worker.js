const CACHE_NAME = 'my-cache-v1';

const CACHE_ASSETS = [
    '/Timer/',
    '/Timer/index.html', '/Timer/stopwatch.html', '/Timer/timer.html',
    '/Timer/manifest.json',
    '/Timer/icon-192.png', '/Timer/icon-512.png',
    '/Timer/PracticeExamTimer.png', '/Timer/Stopwatch.png', '/Timer/Timer.png',
    '/Timer/Play.png', '/Timer/Stop.png', '/Timer/Reset.png',
    '/Timer/alarm.mp3',
    '/Timer/.nojekyll',
    '/Timer/service-worker.js'
];

// ✅ 설치 단계 - 개별 캐싱 + 에러 로깅
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                CACHE_ASSETS.map((asset) =>
                    cache.add(asset).catch((err) => {
                        console.warn(`⚠️ 캐싱 실패: ${asset}`, err);
                    })
                )
            );
        })
    );
});

// ✅ 활성화 단계 - 이전 캐시 정리
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
});

// ✅ fetch 이벤트 - Cache First 전략
self.addEventListener('fetch', (event) => {
    const requestUrl = event.request.url;

    // 확장 프로그램 요청은 무시
    if (requestUrl.startsWith('chrome-extension://')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            return fetch(event.request)
                .then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() =>
                    caches.match('/Timer/index.html') ||
                    new Response('⚠️ 오프라인이고, 캐시도 없습니다.', { status: 404 })
                );
        })
    );
});
