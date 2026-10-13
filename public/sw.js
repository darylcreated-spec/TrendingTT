const CACHE_NAME = 'trending-tt-cache-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Support skipWaiting on postMessage from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Network-first strategy for data feeds with 3s timeout and cache fallback, stale-while-revalidate for assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isDataFeed = url.pathname.includes('/data/') || url.pathname.endsWith('.json');
  const isStaticAsset = Boolean(url.pathname.match(/\.(js|css|png|svg|jpg|jpeg|webp|woff2?)$/));

  if (isDataFeed) {
    // Network-First with 3s timeout for real-time news and utility feeds
    event.respondWith(
      new Promise((resolve) => {
        let timedOut = false;
        const timer = setTimeout(() => {
          timedOut = true;
          caches.match(event.request).then((cached) => {
            if (cached) resolve(cached);
          });
        }, 3000);

        fetch(event.request)
          .then((networkResponse) => {
            clearTimeout(timer);
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            if (!timedOut) {
              resolve(networkResponse);
            }
          })
          .catch(() => {
            clearTimeout(timer);
            caches.match(event.request).then((cached) => {
              if (cached) {
                resolve(cached);
              } else {
                resolve(new Response(JSON.stringify({ error: 'Feed unavailable offline', posts: [] }), {
                  headers: { 'Content-Type': 'application/json' }
                }));
              }
            });
          });
      })
    );
    return;
  }

  if (isStaticAsset) {
    // Cache-First with background revalidation for static assets
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkResponse;
          })
          .catch(() => null);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default network-first for document navigation
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Native Web Push Notification Listener
self.addEventListener('push', (event) => {
  let payload = {
    title: 'TRENDING.TT Alert',
    body: 'Breaking bulletin from Trinidad & Tobago.',
    url: '/',
    tag: 'tt-breaking-alert',
  };

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: '/icon-192.png',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: {
      url: payload.url || '/',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'open', title: 'Read Bulletin' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    tag: payload.tag || 'tt-news-alert',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      // Or open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
