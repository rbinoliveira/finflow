/* eslint-disable */
const VERSION = 'v2'
const CACHE_SHELL = `finflow-shell-${VERSION}`
const CACHE_ASSETS = `finflow-assets-${VERSION}`

const APP_SHELL = [
  '/',
  '/transactions',
  '/cards',
  '/settings',
  '/settings/categories',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
]

const CURRENT_CACHES = [CACHE_SHELL, CACHE_ASSETS]

const OWNED_PREFIX = 'finflow-'

const NETWORK_TIMEOUT_MS = 3500

const UNCACHED_HOSTS = [
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'www.googleapis.com',
  'apis.google.com',
]

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/fonts/')
  )
}

async function precacheAppShell() {
  const cache = await caches.open(CACHE_SHELL)

  await Promise.all(
    APP_SHELL.map(async (route) => {
      try {
        const response = await fetch(route, { cache: 'reload' })
        if (response.ok) await cache.put(route, response)
      } catch {
        /* route unavailable during install */
      }
    }),
  )
}

async function clearOldCaches() {
  const names = await caches.keys()

  await Promise.all(
    names
      .filter((name) => name.startsWith(OWNED_PREFIX))
      .filter((name) => !CURRENT_CACHES.includes(name))
      .map((name) => caches.delete(name)),
  )
}

/* Sem teto, uma rede ruim segura a navegação para sempre e a tela fica em
   branco: depois de NETWORK_TIMEOUT_MS o cache responde e a rede segue. */
function fetchWithTimeout(request) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('network-timeout')),
      NETWORK_TIMEOUT_MS,
    )

    fetch(request).then(
      (response) => {
        clearTimeout(timer)
        resolve(response)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/* `ignoreSearch: true` deixa a navegação dura reaproveitar a mesma entrada
   independente de query string — mas a busca RSC do Next (`?_rsc=...`) devolve
   um Flight stream, não o documento HTML. Se as duas dividem a mesma entrada,
   uma troca de tela client-side recebe o HTML de volta e o roteador trava sem
   erro capturável. Por isso a busca RSC casa só por igualdade exata. */
async function serveNetworkFirst(request, cacheName, fallback, exact) {
  const cache = await caches.open(cacheName)

  try {
    const response = await fetchWithTimeout(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (error) {
    const stored = await cache.match(request, { ignoreSearch: !exact })
    if (stored) return stored

    if (fallback) {
      const backup = await cache.match(fallback)
      if (backup) return backup
    }

    throw error
  }
}

async function serveCacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const stored = await cache.match(request)
  if (stored) return stored

  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

async function serveStaleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const stored = await cache.match(request)

  const update = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => stored)

  return stored || update
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAppShell().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clearOldCaches().then(() => self.clients.claim()))
})

self.addEventListener('message', (event) => {
  if (!event.data) return

  if (event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (UNCACHED_HOSTS.includes(url.hostname)) return
  if (url.origin !== self.location.origin) return

  if (isStaticAsset(url)) {
    event.respondWith(serveCacheFirst(request, CACHE_ASSETS))
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(serveNetworkFirst(request, CACHE_SHELL, '/'))
    return
  }

  if (url.searchParams.has('_rsc')) {
    event.respondWith(serveNetworkFirst(request, CACHE_SHELL, undefined, true))
    return
  }

  event.respondWith(serveStaleWhileRevalidate(request, CACHE_ASSETS))
})
