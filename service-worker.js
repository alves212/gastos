const CACHE_NAME = 'expenses-v1';
const urlsToCache = [
  '/index.html',
  '/manifest.json',
  '/script.js',
  '/service-worker.js',
  '/styles.css',
  '/images/money192.png',
  '/images/money512.png',
  '/images/fallback.png',
];

// Instala o Service Worker e adiciona ao cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Falha ao armazenar no cache:', error);
      }),
  );
});

// Intercepta requisições e retorna do cache, se possível
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request)
          .then((networkResponse) => {
            // Cache dinâmico para novos recursos
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => {
            if (event.request.destination === 'image') {
              return caches.match('/images/fallback.png');
            }
          })
      );
    }),
  );
});

// Ativa o Service Worker e limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`Cache antigo ${cacheName} removido`);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
