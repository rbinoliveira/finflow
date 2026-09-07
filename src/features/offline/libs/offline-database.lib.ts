import {
  OFFLINE_DATABASE_NAME,
  OFFLINE_DATABASE_VERSION,
  OFFLINE_INDEX,
  OFFLINE_STORE,
} from '@/features/offline/constants/offline-storage.constants'

type OfflineStoreName = (typeof OFFLINE_STORE)[keyof typeof OFFLINE_STORE]

let conexao: Promise<IDBDatabase> | null = null

export function offlineStorageAvailable() {
  return typeof indexedDB !== 'undefined'
}

function criarEstruturas(database: IDBDatabase) {
  if (!database.objectStoreNames.contains(OFFLINE_STORE.records)) {
    const records = database.createObjectStore(OFFLINE_STORE.records, {
      keyPath: 'localId',
    })
    records.createIndex(OFFLINE_INDEX.byCollection, 'collection')
  }

  if (!database.objectStoreNames.contains(OFFLINE_STORE.outbox)) {
    const outbox = database.createObjectStore(OFFLINE_STORE.outbox, {
      keyPath: 'id',
    })
    outbox.createIndex(OFFLINE_INDEX.byCreatedAt, 'createdAt')
  }
}

export function openOfflineDatabase() {
  if (!offlineStorageAvailable()) {
    return Promise.reject(new Error('Armazenamento offline indisponível'))
  }

  if (!conexao) {
    conexao = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(
        OFFLINE_DATABASE_NAME,
        OFFLINE_DATABASE_VERSION,
      )

      request.onupgradeneeded = () => criarEstruturas(request.result)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('IndexedDB'))
    }).catch((error: unknown) => {
      conexao = null
      throw error
    })
  }

  return conexao
}

function aguardar<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB'))
  })
}

async function withStore<T>(
  store: OfflineStoreName,
  mode: IDBTransactionMode,
  executar: (objectStore: IDBObjectStore) => IDBRequest<T>,
) {
  const database = await openOfflineDatabase()
  const transacao = database.transaction(store, mode)

  return aguardar(executar(transacao.objectStore(store)))
}

export function readRecord<T>(store: OfflineStoreName, key: string) {
  return withStore<T | undefined>(store, 'readonly', (objectStore) =>
    objectStore.get(key),
  )
}

export function listRecords<T>(store: OfflineStoreName) {
  return withStore<T[]>(store, 'readonly', (objectStore) =>
    objectStore.getAll(),
  )
}

export function listRecordsByIndex<T>(
  store: OfflineStoreName,
  index: string,
  value: IDBValidKey,
) {
  return withStore<T[]>(store, 'readonly', (objectStore) =>
    objectStore.index(index).getAll(value),
  )
}

export function countRecords(store: OfflineStoreName) {
  return withStore<number>(store, 'readonly', (objectStore) =>
    objectStore.count(),
  )
}

export function writeRecord<T>(store: OfflineStoreName, value: T) {
  return withStore<IDBValidKey>(store, 'readwrite', (objectStore) =>
    objectStore.put(value),
  )
}

export function deleteRecord(store: OfflineStoreName, key: string) {
  return withStore<undefined>(store, 'readwrite', (objectStore) =>
    objectStore.delete(key),
  )
}

export async function clearOfflineDatabase() {
  const database = await openOfflineDatabase()
  const transacao = database.transaction(
    [OFFLINE_STORE.records, OFFLINE_STORE.outbox],
    'readwrite',
  )

  transacao.objectStore(OFFLINE_STORE.records).clear()
  transacao.objectStore(OFFLINE_STORE.outbox).clear()
}
