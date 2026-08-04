const CACHE_NAME = 'chefbisu-splash-v3';
const SHELL_FILES = ['/splash.html', '/splash.css', '/splash.js', '/manifest.json'];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(SHELL_FILES); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('message', function (event) { if (event.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);
  if (SHELL_FILES.some(function (file) { return url.pathname === file; })) {
    event.respondWith(caches.match(event.request).then(function (cached) { return cached || fetch(event.request); }));
  }
});