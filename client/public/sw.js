// Service Worker para Biblioteca Moi PWA
// Versión de caché - incrementa cuando actualices archivos
const CACHE_VERSION = 'biblioteca-moi-v1';
const CACHE_NAME = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Archivos críticos que se cachean inmediatamente
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Eliminar cachés antiguos
              return cacheName.startsWith('biblioteca-moi-') && 
                     cacheName !== CACHE_NAME && 
                     cacheName !== DYNAMIC_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear peticiones HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Estrategia: Network First, fallback to Cache
  // Para API requests, siempre intentar red primero
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Solo cachear requests GET (no POST/PATCH/DELETE)
          if (request.method === 'GET') {
            const responseClone = response.clone();
            
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              })
              .catch((error) => {
                console.warn('[SW] Failed to cache API response:', error);
              });
          }
          
          return response;
        })
        .catch(() => {
          // Si falla la red, buscar en caché (solo para GET)
          if (request.method === 'GET') {
            return caches.match(request)
              .then((cachedResponse) => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                
                // Si no hay caché, devolver error offline
                return new Response(
                  JSON.stringify({ 
                    error: 'Sin conexión a internet',
                    offline: true 
                  }),
                  {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                      'Content-Type': 'application/json'
                    })
                  }
                );
              });
          }
          
          // Para requests no-GET que fallan, devolver error sin intentar caché
          return new Response(
            JSON.stringify({ 
              error: 'Sin conexión a internet - operación requiere red',
              offline: true 
            }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'application/json'
              })
            }
          );
        })
    );
    return;
  }

  // Para recursos estáticos: Cache First, fallback to Network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Solo cachear respuestas exitosas y solo GET requests
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Solo cachear GET requests
            if (request.method === 'GET') {
              const responseClone = response.clone();
              
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                })
                .catch((error) => {
                  console.warn('[SW] Failed to cache static resource:', error);
                });
            }

            return response;
          })
          .catch(() => {
            // Si es una página HTML y falla, mostrar página offline
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Manejar mensajes desde el cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Notificaciones push (opcional para futuro)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de Biblioteca Moi',
    icon: '/pwa-icon-192.png',
    badge: '/pwa-icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Biblioteca Moi', options)
  );
});

console.log('[SW] Service Worker loaded successfully');
