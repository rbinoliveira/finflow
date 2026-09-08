import type { SyncCollection } from '@/features/offline/types/offline.type'

export const USERS_COLLECTION = 'users'

export const SYNC_COLLECTIONS: SyncCollection[] = [
  'categories',
  'cards',
  'transactions',
  'installments',
  'recurrences',
]

export function userCollectionPath(
  uid: string,
  collection: SyncCollection,
): string {
  return `${USERS_COLLECTION}/${uid}/${collection}`
}
