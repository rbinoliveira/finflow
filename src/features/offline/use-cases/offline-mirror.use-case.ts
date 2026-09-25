import {
  OFFLINE_INDEX,
  OFFLINE_STORE,
} from '@/features/offline/constants/offline-storage.constants'
import {
  deleteRecord,
  listRecords,
  listRecordsByIndex,
  offlineStorageAvailable,
  readRecord,
  writeRecord,
} from '@/features/offline/libs/offline-database.lib'
import type {
  OfflineRecord,
  SyncCollection,
  SyncedDocument,
} from '@/features/offline/types/offline.type'
import { listOutboxUseCase } from '@/features/offline/use-cases/outbox.use-case'
import { offlineKey } from '@/features/offline/utils/offline-key.util'

export async function readMirrorUseCase<T extends SyncedDocument>(
  collection: SyncCollection,
): Promise<T[]> {
  if (!offlineStorageAvailable()) return []

  try {
    const records = await listRecordsByIndex<OfflineRecord<T>>(
      OFFLINE_STORE.records,
      OFFLINE_INDEX.byCollection,
      collection,
    )

    return records
      .filter((record) => !record.data.deletedAt)
      .map((record) => record.data)
  } catch {
    return []
  }
}

export async function listPendingMirrorUseCase(): Promise<OfflineRecord[]> {
  if (!offlineStorageAvailable()) return []

  try {
    const records = await listRecords<OfflineRecord>(OFFLINE_STORE.records)

    return records.filter((record) => record.pending)
  } catch {
    return []
  }
}

export async function readMirrorDocumentUseCase<T extends SyncedDocument>(
  collection: SyncCollection,
  id: string,
): Promise<T | null> {
  if (!offlineStorageAvailable()) return null

  try {
    const record = await readRecord<OfflineRecord<T>>(
      OFFLINE_STORE.records,
      offlineKey(collection, id),
    )

    if (!record || record.data.deletedAt) return null

    return record.data
  } catch {
    return null
  }
}

export async function writeMirrorUseCase<T extends SyncedDocument>(
  collection: SyncCollection,
  document: T,
  pending: boolean,
): Promise<void> {
  if (!offlineStorageAvailable()) return

  try {
    await writeRecord<OfflineRecord<T>>(OFFLINE_STORE.records, {
      localId: offlineKey(collection, document.id),
      collection,
      id: document.id,
      data: document,
      updatedAt: document.updatedAt,
      pending,
    })
  } catch {
    /* aparelho sem IndexedDB disponível — a rede segue sendo a fonte */
  }
}

export async function removeMirrorUseCase(
  collection: SyncCollection,
  id: string,
): Promise<void> {
  if (!offlineStorageAvailable()) return

  try {
    await deleteRecord(OFFLINE_STORE.records, offlineKey(collection, id))
  } catch {
    /* nada a remover */
  }
}

/** Ids with local changes not yet confirmed by the server, pending or queued. */
export async function listLocalChangesUseCase(
  collection: SyncCollection,
): Promise<Set<string>> {
  const pendentes = (await listPendingMirrorUseCase())
    .filter((record) => record.collection === collection)
    .map((record) => record.id)

  const naFila = (await listOutboxUseCase())
    .filter((mutation) => mutation.collection === collection)
    .map((mutation) => mutation.documentId)

  return new Set([...pendentes, ...naFila])
}

export async function replaceMirrorUseCase<T extends SyncedDocument>(
  collection: SyncCollection,
  documents: T[],
  changedBeforeRead: Set<string> = new Set(),
): Promise<void> {
  if (!offlineStorageAvailable()) return

  const stored = await listRecordsByIndex<OfflineRecord<T>>(
    OFFLINE_STORE.records,
    OFFLINE_INDEX.byCollection,
    collection,
  ).catch(() => [] as OfflineRecord<T>[])

  const incoming = new Map(documents.map((document) => [document.id, document]))

  /* Um registro ainda pendente não pode ser apagado pelo que veio da rede:
     ele é justamente o que a rede ainda não conhece. */
  const obsoletos = stored.filter(
    (record) =>
      !record.pending &&
      !changedBeforeRead.has(record.id) &&
      !incoming.has(record.id),
  )

  /* Nem sobrescrito: a leitura pode chegar antes do envio da edição, e a
     versão antiga do servidor apagaria o que acabou de ser salvo. Vale a fila,
     não a flag — uma mutação descartada não pode prender o registro. */
  const naFila = new Set(
    (await listOutboxUseCase())
      .filter((mutation) => mutation.collection === collection)
      .map((mutation) => mutation.documentId),
  )

  await Promise.all([
    ...obsoletos.map((record) =>
      deleteRecord(OFFLINE_STORE.records, record.localId).catch(
        () => undefined,
      ),
    ),
    ...documents
      .filter(
        (document) =>
          !naFila.has(document.id) && !changedBeforeRead.has(document.id),
      )
      .map((document) => writeMirrorUseCase(collection, document, false)),
  ])
}
