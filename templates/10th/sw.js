const CACHE_NAME = 'nw-library-cache-v1';
const urlsToCache = [
  '10thHome.html',
  'assets/css/main.css',
  'images/pwa-icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
