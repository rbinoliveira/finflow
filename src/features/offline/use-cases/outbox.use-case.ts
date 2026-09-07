import { OFFLINE_STORE } from '@/features/offline/constants/offline-storage.constants'
import {
  deleteRecord,
  listRecords,
  offlineStorageAvailable,
  writeRecord,
} from '@/features/offline/libs/offline-database.lib'
import type {
  OutboxMutation,
  SyncCollection,
  SyncOperation,
} from '@/features/offline/types/offline.type'
import { createLocalId } from '@/features/offline/utils/local-id.util'

export async function listOutboxUseCase(): Promise<OutboxMutation[]> {
  if (!offlineStorageAvailable()) return []

  try {
    const mutations = await listRecords<OutboxMutation>(OFFLINE_STORE.outbox)

    return mutations.sort((first, second) => first.createdAt - second.createdAt)
  } catch {
    return []
  }
}

export async function enqueueMutationUseCase(input: {
  collection: SyncCollection
  documentId: string
  operation: SyncOperation
  payload: Record<string, unknown> | null
}): Promise<OutboxMutation | null> {
  if (!offlineStorageAvailable()) return null

  const mutation: OutboxMutation = {
    id: createLocalId(),
    collection: input.collection,
    documentId: input.documentId,
    operation: input.operation,
    payload: input.payload,
    createdAt: Date.now(),
    attempts: 0,
  }

  try {
    await writeRecord(OFFLINE_STORE.outbox, mutation)

    return mutation
  } catch {
    return null
  }
}

export async function updateMutationUseCase(
  mutation: OutboxMutation,
): Promise<void> {
  if (!offlineStorageAvailable()) return

  await writeRecord(OFFLINE_STORE.outbox, mutation).catch(() => undefined)
}

export async function removeMutationUseCase(id: string): Promise<void> {
  if (!offlineStorageAvailable()) return

  await deleteRecord(OFFLINE_STORE.outbox, id).catch(() => undefined)
}

export async function countPendingUseCase(): Promise<number> {
  const mutations = await listOutboxUseCase()

  return mutations.length
}
