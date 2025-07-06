// Enhanced Service Worker with Performance Optimizations
const CACHE_NAME = 'william-portfolio-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/critical.css',
    '/styles.css',
    '/script-optimized.js',
    '/manifest.json'
];

// External resources to cache
const EXTERNAL_RESOURCES = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
];

// Cache strategies
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(cache => {
                return cache.addAll(STATIC_ASSETS);
            }),
            caches.open(DYNAMIC_CACHE).then(cache => {
                return cache.addAll(EXTERNAL_RESOURCES);
            })
        ]).then(() => {
            return self.skipWaiting();
        })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch Event - Handle requests with appropriate strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (isStaticAsset(request.url)) {
        event.respondWith(cacheFirst(request));
    } else if (isExternalResource(request.url)) {
        event.respondWith(staleWhileRevalidate(request));
    } else if (isAPIRequest(request.url)) {
        event.respondWith(networkFirst(request));
    } else {
        event.respondWith(cacheFirst(request));
    }
});

// Cache First Strategy - Good for static assets
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return getOfflineFallback(request);
    }
}

// Network First Strategy - Good for API requests
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Network first strategy failed:', error);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return getOfflineFallback(request);
    }
}

// Stale While Revalidate Strategy - Good for external resources
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(error => {
        console.error('Stale while revalidate failed:', error);
        return cachedResponse;
    });
    
    return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(url) {
    return STATIC_ASSETS.some(asset => url.includes(asset)) || 
           url.includes('.css') || 
           url.includes('.js') || 
           url.includes('.html');
}

function isExternalResource(url) {
    return url.includes('fonts.googleapis.com') || 
           url.includes('fonts.gstatic.com') || 
           url.includes('cdnjs.cloudflare.com') ||
           url.includes('unsplash.com');
}

function isAPIRequest(url) {
    return url.includes('/api/') || 
           url.includes('.json') ||
           url.includes('sendgrid.com');
}

// Offline fallback
function getOfflineFallback(request) {
    if (request.destination === 'document') {
        return caches.match('/index.html');
    }
    
    if (request.destination === 'image') {
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="#ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="#999">Image offline</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
        );
    }
    
    return new Response('Offline', { status: 503 });
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'contact-form') {
        event.waitUntil(syncContactForm());
    }
});

async function syncContactForm() {
    try {
        const requests = await getStoredRequests();
        
        for (const request of requests) {
            try {
                await fetch(request.url, {
                    method: request.method,
                    headers: request.headers,
                    body: request.body
                });
                
                // Remove successful request from storage
                await removeStoredRequest(request.id);
            } catch (error) {
                console.error('Failed to sync request:', error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// IndexedDB helpers for storing failed requests
async function getStoredRequests() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PortfolioSW', 1);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['requests'], 'readonly');
            const store = transaction.objectStore('requests');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('requests')) {
                db.createObjectStore('requests', { keyPath: 'id' });
            }
        };
    });
}

async function removeStoredRequest(id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PortfolioSW', 1);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['requests'], 'readwrite');
            const store = transaction.objectStore('requests');
            const deleteRequest = store.delete(id);
            
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
    });
}

// Push notification handling
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: data.primaryKey
        },
        actions: [
            {
                action: 'explore',
                title: 'View',
                icon: '/icon-check.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-x.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cache-update') {
        event.waitUntil(updateCache());
    }
});

async function updateCache() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();
        
        // Update external resources
        for (const request of requests) {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    await cache.put(request, response);
                }
            } catch (error) {
                console.error('Failed to update cache for:', request.url);
            }
        }
    } catch (error) {
        console.error('Cache update failed:', error);
    }
}

// Performance monitoring
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GET_PERFORMANCE_METRICS') {
        const metrics = {
            cacheHitRatio: getCacheHitRatio(),
            cacheSize: getCacheSize(),
            networkRequests: getNetworkRequestCount()
        };
        
        event.ports[0].postMessage(metrics);
    }
});

// Cache analytics
let cacheHits = 0;
let cacheMisses = 0;
let networkRequests = 0;

function getCacheHitRatio() {
    const total = cacheHits + cacheMisses;
    return total > 0 ? (cacheHits / total) * 100 : 0;
}

async function getCacheSize() {
    try {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            totalSize += keys.length;
        }
        
        return totalSize;
    } catch (error) {
        console.error('Failed to get cache size:', error);
        return 0;
    }
}

function getNetworkRequestCount() {
    return networkRequests;
}

// Log cache hits and misses
const originalCacheMatch = caches.match;
caches.match = async function(...args) {
    const result = await originalCacheMatch.apply(this, args);
    if (result) {
        cacheHits++;
    } else {
        cacheMisses++;
    }
    return result;
};

// Log network requests
const originalFetch = fetch;
self.fetch = function(...args) {
    networkRequests++;
    return originalFetch.apply(this, args);
};

console.log('Service Worker script loaded');