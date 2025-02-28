self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        'Tools/icon-192.png',
        'Tools/icon-512.png'
      ]);
    })
  );
});
