import {
  SERVICE_WORKER_PATH,
  SERVICE_WORKER_SCOPE,
} from '@/features/offline/constants/offline-storage.constants'

export function serviceWorkerAvailable() {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator
}

export async function recordServiceWorker() {
  if (!serviceWorkerAvailable()) return null

  try {
    const record = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
      scope: SERVICE_WORKER_SCOPE,
      updateViaCache: 'none',
    })

    await record.update().catch(() => undefined)

    return record
  } catch {
    return null
  }
}

/** Sem isso o iOS pode descartar o IndexedDB do PWA depois de dias sem uso,
 *  levando junto os lançamentos que ainda não subiram. */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
    return false
  }

  try {
    if (await navigator.storage.persisted()) return true

    return await navigator.storage.persist()
  } catch {
    return false
  }
}
