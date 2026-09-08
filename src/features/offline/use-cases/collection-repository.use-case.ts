import { collection as firestoreCollection, getDocs } from 'firebase/firestore'

import { userCollectionPath } from '@/features/offline/constants/firestore-collections.constants'
import type {
  SyncCollection,
  SyncedDocument,
} from '@/features/offline/types/offline.type'
import {
  readMirrorUseCase,
  removeMirrorUseCase,
  replaceMirrorUseCase,
  writeMirrorUseCase,
} from '@/features/offline/use-cases/offline-mirror.use-case'
import { enqueueMutationUseCase } from '@/features/offline/use-cases/outbox.use-case'
import { syncOutboxUseCase } from '@/features/offline/use-cases/sync-outbox.use-case'
import { isOnline } from '@/features/offline/utils/network-status.util'
import { db } from '@/shared/libs/firebase'

/**
 * O espelho local é a fonte que a tela lê. A rede só atualiza o espelho — assim
 * a lista aparece igual com ou sem conexão, e o que foi criado offline não some
 * quando a resposta do servidor chega sem ele.
 */
export async function listCollectionUseCase<T extends SyncedDocument>(
  uid: string,
  collection: SyncCollection,
): Promise<T[]> {
  if (isOnline()) {
    try {
      const snapshot = await getDocs(
        firestoreCollection(db, userCollectionPath(uid, collection)),
      )

      const documents = snapshot.docs.map(
        (entry) => ({ ...entry.data(), id: entry.id }) as T,
      )

      await replaceMirrorUseCase(collection, documents)
    } catch {
      /* sem resposta agora — o espelho responde pela tela */
    }
  }

  return readMirrorUseCase<T>(collection)
}

export async function saveDocumentUseCase<T extends SyncedDocument>(
  uid: string,
  collection: SyncCollection,
  document: T,
  operation: 'create' | 'update' = 'create',
): Promise<T> {
  await writeMirrorUseCase(collection, document, true)

  await enqueueMutationUseCase({
    collection,
    documentId: document.id,
    operation,
    payload: document as unknown as Record<string, unknown>,
  })

  syncOutboxUseCase(uid).catch(() => undefined)

  return document
}

export async function saveManyDocumentsUseCase<T extends SyncedDocument>(
  uid: string,
  collection: SyncCollection,
  documents: T[],
): Promise<T[]> {
  for (const document of documents) {
    await writeMirrorUseCase(collection, document, true)

    await enqueueMutationUseCase({
      collection,
      documentId: document.id,
      operation: 'create',
      payload: document as unknown as Record<string, unknown>,
    })
  }

  syncOutboxUseCase(uid).catch(() => undefined)

  return documents
}

export async function removeDocumentUseCase(
  uid: string,
  collection: SyncCollection,
  id: string,
): Promise<void> {
  await removeMirrorUseCase(collection, id)

  await enqueueMutationUseCase({
    collection,
    documentId: id,
    operation: 'delete',
    payload: null,
  })

  syncOutboxUseCase(uid).catch(() => undefined)
}

export async function removeManyDocumentsUseCase(
  uid: string,
  collection: SyncCollection,
  ids: string[],
): Promise<void> {
  for (const id of ids) {
    await removeMirrorUseCase(collection, id)

    await enqueueMutationUseCase({
      collection,
      documentId: id,
      operation: 'delete',
      payload: null,
    })
  }

  syncOutboxUseCase(uid).catch(() => undefined)
}
