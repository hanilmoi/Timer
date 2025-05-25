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
  '/Timer/alarm.mp3',
  '/Timer/.nojekyll',
  // '/Timer/service-worker.js' 보통 서비스워커는 캐시 안 함, 필요하면 추가
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of CACHE_ASSETS) {
        try {
          const response = await fetch(asset);
          await cache.put(asset, response.clone());
          console.log(`✅ install: ${asset} 캐싱 성공`);
        } catch (err) {
          console.warn(`❌ install: ${asset} 캐싱 실패`, err);
        }
      }
    })
  );
  self.skipWaiting(); // 설치 후 즉시 활성화 (선택사항)
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
  self.clients.claim(); // 활성화 즉시 페이지 컨트롤 (선택사항)
});

self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  if (requestUrl.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      return (
        cacheRes ||
        fetch(event.request)
          .then((fetchRes) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, fetchRes.clone());
              return fetchRes;
            });
          })
          .catch(() => {
            // 네트워크 실패 시 캐시 없으면 기본 에러 응답
            return new Response('⚠️ 네트워크 오류 & 캐시 없음', {
              status: 404,
              statusText: 'Not Found',
            });
          })
      );
    })
  );
});
