/**
 * ====================================================
 * Service Worker - Health Tracker
 * ====================================================
 * Cache และ Offline Support สำหรับ PWA
 */

const CACHE_NAME = 'health-tracker-v1.0.2';
const CACHE_URLS = [
    './',
    './index.html',
    './login.html',
    './dashboard.html',
    './change_password.html',
    './admin.html',
    './css/style.css',
    './js/api.js',
    './js/auth.js',
    './js/charts.js',
    './js/admin.js',
    './js/pwa.js',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    // External CDN resources
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// ====================================================
// INSTALL EVENT
// ====================================================

self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(CACHE_URLS);
            })
            .then(() => {
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Cache failed:', error);
            })
    );
});

// ====================================================
// ACTIVATE EVENT
// ====================================================

self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => cacheName !== CACHE_NAME)
                        .map((cacheName) => {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// ====================================================
// FETCH EVENT
// ====================================================

self.addEventListener('fetch', (event) => {
    const requestURL = new URL(event.request.url);

    // Skip non-http(s) requests (e.g., chrome-extension://)
    if (!requestURL.protocol.startsWith('http')) {
        return;
    }

    // Skip API calls (Google Apps Script)
    if (requestURL.hostname === 'script.google.com' ||
        requestURL.hostname === 'script.googleusercontent.com') {
        return;
    }

    // Network first, fall back to cache for other requests
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone the response
                const responseClone = response.clone();

                // Cache the new response
                caches.open(CACHE_NAME)
                    .then((cache) => {
                        // Only cache GET requests
                        if (event.request.method === 'GET') {
                            cache.put(event.request, responseClone);
                        }
                    });

                return response;
            })
            .catch(() => {
                // If network fails, try cache
                return caches.match(event.request)
                    .then((response) => {
                        if (response) {
                            return response;
                        }

                        // If no cache found, return offline page for HTML requests
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('./login.html');
                        }

                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// ====================================================
// PUSH NOTIFICATION (Future)
// ====================================================

self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push received');

    const options = {
        body: event.data ? event.data.text() : 'มีข้อความใหม่',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('Health Tracker', options)
    );
});

// ====================================================
// NOTIFICATION CLICK
// ====================================================

self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification click');
    event.notification.close();

    event.waitUntil(
        clients.openWindow('./dashboard.html')
    );
});
