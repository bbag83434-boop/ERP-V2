const CACHE_NAME = 'chefbisu-splash-v2'; // bumped so update flow can be detected
const SHELL_FILES = [
  '/splash.html',
  '/splash.css',
  '/splash.js',
  '/manifest.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_FILES);
    })
  );
  // skipWaiting() removed from here — now only runs when user taps "Update Now"
  // (see message listener below). This lets login.js detect the waiting worker
  // and show the update bar before activating it.
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Allows the page to tell a waiting worker to activate now (Update Now button)
self.addEventListener('message', function (event) {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Cache-first ONLY for the splash shell files, so the app opens
// instantly even if the Render server is asleep. Everything else
// (login page, API calls, dashboard data) always goes to network.
self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);
  const isShellFile = SHELL_FILES.some(function (f) {
    return url.pathname === f;
  });

  if (isShellFile) {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        return cached || fetch(event.request);
      })
    );
  }
  // else: let the request go to network normally (default behavior)
});