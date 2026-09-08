export type SyncCollection =
  'cards' | 'categories' | 'transactions' | 'installments' | 'recurrences'

export type SyncOperation = 'create' | 'update' | 'delete'

export type SyncedDocument = {
  id: string
  updatedAt: number
  deletedAt?: number | null
}

export type OfflineRecord<T extends SyncedDocument = SyncedDocument> = {
  localId: string
  collection: SyncCollection
  id: string
  data: T
  updatedAt: number
  pending: boolean
}

export type OutboxMutation = {
  id: string
  collection: SyncCollection
  documentId: string
  operation: SyncOperation
  payload: Record<string, unknown> | null
  createdAt: number
  attempts: number
}

export type SyncState = {
  online: boolean
  pending: number
  syncing: boolean
  lastSyncedAt: number | null
}
