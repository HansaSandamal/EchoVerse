const CACHE_NAME = 'echoverse-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  'index.html',
  'manifest.json',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/screenshot-home.png',
  'assets/screenshot-progress.png',
  'assets/screenshot-insights.png'
];

// Install event: cache all core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Adding a filter for successful fetches to make caching more robust.
        const cachePromises = ASSETS_TO_CACHE.map(assetUrl => {
            return fetch(assetUrl)
                .then(response => {
                    if (response.ok) {
                        return cache.put(assetUrl, response);
                    }
                    console.warn(`Skipping caching for ${assetUrl} - ${response.status}`);
                    return Promise.resolve();
                })
                .catch(err => {
                    console.warn(`Failed to fetch ${assetUrl} for caching.`, err);
                });
        });
        return Promise.all(cachePromises);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serve assets from cache first, then network
self.addEventListener('fetch', event => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
      return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response.
            // Don't cache opaque responses (from CDNs without CORS).
            if (!response || response.status !== 200 || response.type === 'opaque') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // We don't want to cache API requests, etc.
                if (event.request.url.startsWith('http')) {
                   cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        ).catch(err => {
            // If fetch fails (e.g., offline), and it's a navigation request,
            // you could return a fallback offline page.
            console.error('Fetch failed; returning offline page instead.', err);
            // For now, we just let the browser handle the error.
            return new Response('Network error happened', {
                status: 408,
                headers: { 'Content-Type': 'text/plain' },
            });
        });
      })
    );
});