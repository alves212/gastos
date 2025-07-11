const CACHE_NAME = 'expenses-v2'
const urlsToCache = [
  '/gastos/',
  '/gastos/index.html',
  '/gastos/manifest.json',
  '/gastos/styles.css',
  '/gastos/firebase.js',
  '/gastos/script.js',
  '/gastos/auth.js',
  '/gastos/images/up.png',
  '/gastos/images/down.png',
  '/gastos/images/fallback.png',
  '/gastos/images/money192.png',
  '/gastos/images/money512.png',
]

// Instala o service worker e armazena arquivos no cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  )
  self.skipWaiting() // Ativa imediatamente o novo SW
})

// Intercepta requisições para servir do cache se possível
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => {
          // Retorno alternativo se estiver offline e a URL não estiver em cache
          if (event.request.destination === 'image') {
            return caches.match('/gastos/images/fallback.png')
          }
        })
      )
    }),
  )
})

// Remove caches antigos durante a ativação
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName)
          }
        }),
      ),
    ),
  )
  self.clients.claim() // Controla as páginas imediatamente
})
