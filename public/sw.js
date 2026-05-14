const CACHE_PAGES   = 'epreuves-pages-v1'
const CACHE_STATIC  = 'epreuves-static-v1'
const CACHE_PDFS    = 'epreuves-pdfs-v1'

const PDF_ORIGIN = 'fmyxzpgmxeduexgpkqiu.supabase.co'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', event => {
  const keep = [CACHE_PAGES, CACHE_STATIC, CACHE_PDFS]
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // PDFs Supabase → Cache-first (30 jours)
  if (url.hostname === PDF_ORIGIN && url.pathname.includes('/object/public/')) {
    event.respondWith(
      caches.open(CACHE_PDFS).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached
          return fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
        })
      )
    )
    return
  }

  // Assets Next.js (_next/static) → Cache-first (immutable)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(CACHE_STATIC).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached
          return fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
        })
      )
    )
    return
  }

  // Navigation (pages HTML) → Network-first, fallback cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone()
          caches.open(CACHE_PAGES).then(cache => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match(request).then(cached => cached ?? caches.match('/')))
    )
    return
  }
})
