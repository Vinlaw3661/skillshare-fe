// public/sw.js
const CACHE_NAME = 'skillshare-cache-v1';

// Assets to immediately cache when the user first opens the app
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  // Normally we would cache CSS/JS bundles here too
];

// Install Event: Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Fetch Event: The "Offline-First" Strategy (Stale-While-Revalidate)
self.addEventListener('fetch', (event) => {
  // Only intercept API requests to DigitalOcean
  if (event.request.url.includes('ondigitalocean.app')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        // 1. Check if we have a cached version of this API response
        const cachedResponse = await cache.match(event.request);

        // 2. Try to fetch the freshest data from the internet
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // If successful, save the new data to the cache
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => {
          // If the network fails (no wifi), return the cached version!
          return cachedResponse;
        });

        // 3. Return the cached response immediately if it exists, otherwise wait for the network
        return cachedResponse || fetchPromise;
      })
    );
  }
});