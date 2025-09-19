// Service Worker for Odisha Rural Education Platform
// Handles offline functionality, asset caching, and background sync
// Optimized for rural connectivity with intelligent caching strategies

const CACHE_NAME = 'odisha-education-v1.0.0';
const GAME_ASSETS_CACHE = 'game-assets-v1.0.0';
const CURRICULUM_CACHE = 'curriculum-content-v1.0.0';
const API_CACHE = 'api-responses-v1.0.0';

// Assets to cache immediately on install
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/_next/static/css/app.css',
  '/_next/static/js/app.js',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/fonts/inter.woff2',
  '/assets/sounds/success.mp3',
  '/assets/sounds/error.mp3',
  '/assets/sounds/notification.mp3'
];

// Game assets to cache for offline play
const GAME_ASSETS = [
  '/assets/games/common/ui-elements.png',
  '/assets/games/common/buttons.png',
  '/assets/games/common/backgrounds.jpg',
  '/assets/games/drag-drop/drag-cursor.png',
  '/assets/games/drag-drop/drop-zone.png',
  '/assets/games/memory/card-back.png',
  '/assets/games/memory/card-flip.mp3',
  '/assets/games/puzzle/piece-template.png',
  '/assets/games/simulation/lab-equipment.png',
  '/assets/games/strategy/board-template.png'
];

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/games',
  '/api/student/stats',
  '/api/achievements',
  '/api/leaderboard'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache core assets
      caches.open(CACHE_NAME).then(cache => {
        console.log('📦 Caching core assets');
        return cache.addAll(CORE_ASSETS);
      }),
      
      // Cache game assets
      caches.open(GAME_ASSETS_CACHE).then(cache => {
        console.log('🎮 Caching game assets');
        return cache.addAll(GAME_ASSETS);
      })
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      // Skip waiting to activate immediately
      self.skipWaiting();
    }).catch(error => {
      console.error('❌ Service Worker installation failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && 
              cacheName !== GAME_ASSETS_CACHE && 
              cacheName !== CURRICULUM_CACHE &&
              cacheName !== API_CACHE) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - network first with cache fallback
    event.respondWith(handleAPIRequest(request));
  } else if (url.pathname.startsWith('/assets/games/')) {
    // Game assets - cache first
    event.respondWith(handleGameAssetRequest(request));
  } else if (url.pathname.startsWith('/_next/static/')) {
    // Static assets - cache first
    event.respondWith(handleStaticAssetRequest(request));
  } else {
    // HTML pages - network first with cache fallback
    event.respondWith(handlePageRequest(request));
  }
});

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  const cacheName = API_CACHE;
  
  try {
    // Try network first
    const networkResponse = await fetch(request.clone());
    
    // Cache successful responses
    if (networkResponse.ok && CACHEABLE_APIS.some(api => url.pathname.startsWith(api))) {
      const cache = await caches.open(cacheName);
      cache.put(request.clone(), networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed, trying cache for:', url.pathname);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for critical APIs
    if (url.pathname === '/api/games') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Offline - games will be loaded from local storage',
        games: []
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Handle game assets with cache-first strategy
async function handleGameAssetRequest(request) {
  const cachedResponse = await caches.match(request, {
    cacheName: GAME_ASSETS_CACHE
  });
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(GAME_ASSETS_CACHE);
      cache.put(request.clone(), networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Failed to load game asset:', request.url);
    
    // Return a placeholder image for missing game assets
    return new Response(
      '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#f3f4f6"/><text x="50" y="55" font-family="Arial" font-size="12" fill="#6b7280" text-anchor="middle">Asset Missing</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAssetRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request.clone(), networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful HTML responses
    if (networkResponse.ok && networkResponse.headers.get('content-type')?.includes('text/html')) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request.clone(), networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed, trying cache for:', request.url);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    throw error;
  }
}

// Background sync for game progress
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'game-progress-sync') {
    event.waitUntil(syncGameProgress());
  } else if (event.tag === 'curriculum-sync') {
    event.waitUntil(syncCurriculumContent());
  }
});

// Sync game progress when online
async function syncGameProgress() {
  try {
    console.log('📊 Syncing game progress...');
    
    // Get pending sync items from IndexedDB
    const db = await openIndexedDB();
    const transaction = db.transaction(['offlineQueue'], 'readonly');
    const store = transaction.objectStore('offlineQueue');
    const unsyncedItems = await getAllFromStore(store);
    
    for (const item of unsyncedItems.filter(i => !i.synced)) {
      try {
        const response = await fetch('/api/games/sync-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${item.authToken}`
          },
          body: JSON.stringify(item.data)
        });
        
        if (response.ok) {
          // Mark as synced
          const updateTransaction = db.transaction(['offlineQueue'], 'readwrite');
          const updateStore = updateTransaction.objectStore('offlineQueue');
          await updateStore.put({ ...item, synced: true });
          
          console.log('✅ Synced progress item:', item.id);
        }
      } catch (error) {
        console.error('❌ Failed to sync item:', item.id, error);
      }
    }
    
    console.log('✅ Game progress sync completed');
  } catch (error) {
    console.error('❌ Game progress sync failed:', error);
  }
}

// Sync curriculum content
async function syncCurriculumContent() {
  try {
    console.log('📚 Syncing curriculum content...');
    
    // Check for curriculum updates
    const response = await fetch('/api/curriculum/updates');
    if (response.ok) {
      const updates = await response.json();
      
      if (updates.hasUpdates) {
        const cache = await caches.open(CURRICULUM_CACHE);
        
        for (const update of updates.content) {
          const contentResponse = await fetch(update.url);
          if (contentResponse.ok) {
            await cache.put(update.cacheKey, contentResponse);
          }
        }
        
        console.log('✅ Curriculum content updated');
      }
    }
  } catch (error) {
    console.error('❌ Curriculum sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('📱 Push notification received');
  
  const options = {
    body: 'You have new achievements to unlock!',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Play Games',
        icon: '/assets/icons/play-icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/icons/close-icon.png'
      }
    ]
  };
  
  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.data = { ...options.data, ...payload.data };
  }
  
  event.waitUntil(
    self.registration.showNotification('Odisha Education Platform', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/games')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', event => {
  console.log('💬 Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CACHE_GAME_ASSETS') {
    event.waitUntil(cacheGameAssets(event.data.assets));
  } else if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

// Cache specific game assets
async function cacheGameAssets(assets) {
  try {
    const cache = await caches.open(GAME_ASSETS_CACHE);
    await cache.addAll(assets);
    console.log('✅ Game assets cached:', assets.length);
  } catch (error) {
    console.error('❌ Failed to cache game assets:', error);
  }
}

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('✅ All caches cleared');
  } catch (error) {
    console.error('❌ Failed to clear caches:', error);
  }
}

// Utility functions
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OdishaEducationGameDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Periodic cleanup
setInterval(() => {
  // Clean up old cache entries
  caches.keys().then(cacheNames => {
    cacheNames.forEach(async cacheName => {
      if (cacheName.includes('api-responses')) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        // Remove entries older than 1 hour
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        requests.forEach(async request => {
          const response = await cache.match(request);
          const dateHeader = response?.headers.get('date');
          if (dateHeader && new Date(dateHeader).getTime() < oneHourAgo) {
            cache.delete(request);
          }
        });
      }
    });
  });
}, 60 * 60 * 1000); // Run every hour

console.log('🎮 Odisha Education Platform Service Worker loaded');
