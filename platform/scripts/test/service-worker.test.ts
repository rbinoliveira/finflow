import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'

const ORIGIN = 'https://finflow.test'

type FakeRequest = { url: string; method: string; mode?: string }

type FakeEvent = {
  request: FakeRequest
  respondWith: (value: Promise<Response>) => void
  waitUntil: (value: Promise<unknown>) => void
}

type Listener = (event: FakeEvent) => void

type Harness = {
  listeners: Map<string, Listener>
  caches: Map<string, Map<string, Response>>
}

function keyOf(input: unknown): string {
  if (typeof input === 'string') return new URL(input, ORIGIN).href

  return new URL((input as { url: string }).url).href
}

function loadWorker(fetchImpl: (request: FakeRequest) => Promise<Response>) {
  const listeners = new Map<string, Listener>()
  const stores = new Map<string, Map<string, Response>>()

  const storeFor = (name: string) => {
    const existing = stores.get(name)
    if (existing) return existing

    const created = new Map<string, Response>()
    stores.set(name, created)
    return created
  }

  const openCache = (name: string) => ({
    match: async (input: unknown) => storeFor(name).get(keyOf(input))?.clone(),
    put: async (input: unknown, response: Response) => {
      storeFor(name).set(keyOf(input), response)
    },
  })

  const context: Record<string, unknown> = {
    self: {
      addEventListener: (type: string, listener: Listener) =>
        listeners.set(type, listener),
      location: { origin: ORIGIN },
      skipWaiting: async () => undefined,
      clients: { claim: async () => undefined },
    },
    caches: {
      open: async (name: string) => openCache(name),
      keys: async () => [...stores.keys()],
      delete: async (name: string) => stores.delete(name),
    },
    fetch: fetchImpl,
    Request,
    Response,
    URL,
    Promise,
    Error,
    setTimeout,
    clearTimeout,
  }

  vm.createContext(context)
  vm.runInContext(readFileSync('public/sw.js', 'utf8'), context)

  return { listeners, caches: stores } satisfies Harness
}

function navigate(url: string): FakeRequest {
  return { url: new URL(url, ORIGIN).href, method: 'GET', mode: 'navigate' }
}

function subRequest(url: string): FakeRequest {
  return { url: new URL(url, ORIGIN).href, method: 'GET', mode: 'cors' }
}

async function fire(harness: Harness, request: FakeRequest) {
  const listener = harness.listeners.get('fetch')
  assert.ok(listener, 'nenhum listener de fetch registrado')

  let responded: Promise<Response> | null = null
  const pending: Promise<unknown>[] = []

  listener({
    request,
    respondWith: (value) => {
      responded = value
    },
    waitUntil: (value) => {
      pending.push(value)
    },
  })

  return { responded: responded as Promise<Response> | null, pending }
}

function shell(harness: Harness) {
  return harness.caches.get('finflow-shell-v3') ?? new Map<string, Response>()
}

function seedShell(harness: Harness, path: string, body: string) {
  const store = harness.caches.get('finflow-shell-v3') ?? new Map()
  store.set(new URL(path, ORIGIN).href, new Response(body))
  harness.caches.set('finflow-shell-v3', store)
}

const nuncaResponde = () => new Promise<Response>(() => undefined)

test('a navegação responde do cache sem esperar a rede', async () => {
  const harness = loadWorker(nuncaResponde)
  seedShell(harness, '/', 'documento em cache')

  const { responded } = await fire(harness, navigate('/'))
  assert.ok(responded)

  assert.equal(await (await responded).text(), 'documento em cache')
})

test('query string reaproveita a entrada do mesmo caminho', async () => {
  const harness = loadWorker(nuncaResponde)
  seedShell(harness, '/transactions', 'tela de lançamentos')

  const { responded } = await fire(
    harness,
    navigate('/transactions?month=2026-09'),
  )
  assert.ok(responded)

  assert.equal(await (await responded).text(), 'tela de lançamentos')
})

test('a revalidação por trás grava a versão nova no caminho', async () => {
  const harness = loadWorker(async () => new Response('documento novo'))
  seedShell(harness, '/', 'documento antigo')

  const { responded, pending } = await fire(harness, navigate('/'))
  assert.equal(await (await responded!).text(), 'documento antigo')

  await Promise.all(pending)

  const guardado = shell(harness).get(`${ORIGIN}/`)
  assert.equal(await guardado!.clone().text(), 'documento novo')
})

test('a busca RSC nunca recebe o documento da navegação', async () => {
  const harness = loadWorker(async () => {
    throw new Error('offline')
  })
  seedShell(harness, '/', '<html>documento</html>')

  const { responded } = await fire(harness, subRequest('/?_rsc=abc123'))

  await assert.rejects(responded!)
})

test('rota sem cópia local cai no documento raiz quando falta rede', async () => {
  const harness = loadWorker(async () => {
    throw new Error('offline')
  })
  seedShell(harness, '/', 'documento raiz')

  const { responded } = await fire(harness, navigate('/cards/abc123'))

  assert.equal(await (await responded!).text(), 'documento raiz')
})

test('sem cache e sem rede, a navegação falha em vez de responder vazio', async () => {
  const harness = loadWorker(async () => {
    throw new Error('offline')
  })

  const { responded } = await fire(harness, navigate('/transactions'))

  await assert.rejects(responded!)
})

test('o precache da instalação cobre /recurrences', async () => {
  const harness = loadWorker(async () => new Response('ok'))
  const listener = harness.listeners.get('install')
  assert.ok(listener)

  const pending: Promise<unknown>[] = []
  listener({
    request: navigate('/'),
    respondWith: () => undefined,
    waitUntil: (value) => {
      pending.push(value)
    },
  })

  await Promise.all(pending)

  const guardadas = [...shell(harness).keys()]

  assert.ok(guardadas.includes(`${ORIGIN}/recurrences`))
  assert.ok(guardadas.includes(`${ORIGIN}/`))
  assert.ok(guardadas.includes(`${ORIGIN}/transactions`))
})
