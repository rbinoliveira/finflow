import type { SyncCollection } from '@/features/offline/types/offline.type'

export function offlineKey(collection: SyncCollection, id: string): string {
  return `${collection}:${id}`
}
