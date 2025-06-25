
// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)
const CACHE = "pwabuilder-offline-page";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const offlineFallbackPage = "offline.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE
  })
);

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;
        if (preloadResp) return preloadResp;
        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});

// --- PUSH NOTIFICATION HANDLING ---
self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {}
  const title = data.title || "Fruit Tapper 🍎";
  const options = {
    body: data.body || "You have a new notification!",
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: data.url || '/'
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});



// --- Background Sync Example ---
self.addEventListener('sync', event => {
  if (event.tag === 'sync-taps') {
    event.waitUntil(syncTaps());
  }
});
async function syncTaps() {
  // Placeholder for queued tap sync
}

// --- Periodic Sync Example ---
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-game-data') {
    event.waitUntil(updateGameData());
  }
});
async function updateGameData() {
  // Placeholder for periodic update (fetch data, etc.)
}
