import { deleteDoc, doc, setDoc } from 'firebase/firestore'

import { userCollectionPath } from '@/features/offline/constants/firestore-collections.constants'
import { SYNC_RETRY_LIMIT } from '@/features/offline/constants/offline-storage.constants'
import type { OutboxMutation } from '@/features/offline/types/offline.type'
import {
  listOutboxUseCase,
  removeMutationUseCase,
  updateMutationUseCase,
} from '@/features/offline/use-cases/outbox.use-case'
import { readMirrorDocumentUseCase, writeMirrorUseCase } from '@/features/offline/use-cases/offline-mirror.use-case'
import { isOnline } from '@/features/offline/utils/network-status.util'
import { db } from '@/shared/libs/firebase'

type SyncResult = {
  applied: number
  pending: number
}

async function applyMutation(
  uid: string,
  mutation: OutboxMutation,
): Promise<void> {
  const reference = doc(
    db,
    userCollectionPath(uid, mutation.collection),
    mutation.documentId,
  )

  if (mutation.operation === 'delete') {
    await deleteDoc(reference)
    return
  }

  await setDoc(reference, mutation.payload ?? {}, {
    merge: mutation.operation === 'update',
  })
}

async function settleMirror(
  mutation: OutboxMutation,
): Promise<void> {
  if (mutation.operation === 'delete') return

  const stored = await readMirrorDocumentUseCase(
    mutation.collection,
    mutation.documentId,
  )

  if (!stored) return

  await writeMirrorUseCase(mutation.collection, stored, false)
}

let emAndamento: Promise<SyncResult> | null = null

/**
 * Descarrega a fila em ordem de criação. A ordem importa: uma despesa e as
 * parcelas dela saem juntas, e uma edição só faz sentido depois da criação.
 */
export function syncOutboxUseCase(uid: string): Promise<SyncResult> {
  if (emAndamento) return emAndamento

  emAndamento = (async () => {
    if (!isOnline()) {
      const mutations = await listOutboxUseCase()

      return { applied: 0, pending: mutations.length }
    }

    const mutations = await listOutboxUseCase()
    let applied = 0

    for (const mutation of mutations) {
      try {
        await applyMutation(uid, mutation)
        await removeMutationUseCase(mutation.id)
        await settleMirror(mutation)
        applied += 1
      } catch {
        const attempts = mutation.attempts + 1

        if (attempts >= SYNC_RETRY_LIMIT) {
          await removeMutationUseCase(mutation.id)
        } else {
          await updateMutationUseCase({ ...mutation, attempts })
        }

        break
      }
    }

    const restantes = await listOutboxUseCase()

    return { applied, pending: restantes.length }
  })().finally(() => {
    emAndamento = null
  })

  return emAndamento
}
