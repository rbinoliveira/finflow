/* eslint-disable */
const VERSION = 'v3'
const CACHE_SHELL = `finflow-shell-${VERSION}`
const CACHE_ASSETS = `finflow-assets-${VERSION}`

const APP_SHELL = [
  '/',
  '/transactions',
  '/cards',
  '/recurrences',
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

const NAVIGATION_FALLBACK = '/'

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

/* A busca RSC do Next (`?_rsc=...`) devolve um Flight stream, não HTML, e
   precisa casar por igualdade exata: servir um documento no lugar dela trava o
   roteador sem erro capturável. Por isso ela nunca divide entrada com a
   navegação — que é guardada por caminho, em `shellKey`. */
async function serveNetworkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)

  try {
    const response = await fetchWithTimeout(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (error) {
    const stored = await cache.match(request)
    if (stored) return stored

    throw error
  }
}

/**
 * A entrada da navegação é o caminho, sem query: `/transactions?month=…` e
 * `/transactions` são o mesmo documento, e o precache já guarda assim. Isso
 * também mantém a busca RSC num endereço próprio, sem o `ignoreSearch` que
 * antes fazia as duas se encostarem.
 */
function shellKey(url) {
  return new Request(new URL(url.pathname, self.location.origin).href)
}

/**
 * O documento sai do cache na hora e a rede revalida por trás.
 *
 * Antes a navegação esperava a rede — até `NETWORK_TIMEOUT_MS` de tela vazia
 * numa conexão ruim, justamente o trecho em que nada pode ser desenhado,
 * porque a splash mora dentro do HTML que está sendo aguardado. O preço é ver
 * a versão anterior numa abertura e a nova na seguinte.
 */
async function serveShell(event) {
  const cache = await caches.open(CACHE_SHELL)
  const key = shellKey(new URL(event.request.url))

  const update = fetch(event.request)
    .then((response) => {
      if (response.ok) cache.put(key, response.clone())
      return response
    })
    .catch(() => null)

  event.waitUntil(update)

  const stored = await cache.match(key)
  if (stored) return stored

  const fresh = await update
  if (fresh) return fresh

  const fallback = await cache.match(NAVIGATION_FALLBACK)
  if (fallback) return fallback

  throw new Error('sem rede e sem cópia local desta tela')
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
    event.respondWith(serveShell(event))
    return
  }

  if (url.searchParams.has('_rsc')) {
    event.respondWith(serveNetworkFirst(request, CACHE_SHELL))
    return
  }

  event.respondWith(serveStaleWhileRevalidate(request, CACHE_ASSETS))
})
