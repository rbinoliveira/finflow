import { deleteDoc, doc, setDoc } from 'firebase/firestore'

import { userCollectionPath } from '@/features/offline/constants/firestore-collections.constants'
import type { OutboxMutation } from '@/features/offline/types/offline.type'
import {
  listPendingMirrorUseCase,
  readMirrorDocumentUseCase,
  writeMirrorUseCase,
} from '@/features/offline/use-cases/offline-mirror.use-case'
import {
  enqueueMutationUseCase,
  listOutboxUseCase,
  removeMutationUseCase,
  updateMutationUseCase,
} from '@/features/offline/use-cases/outbox.use-case'
import { isOnline } from '@/features/offline/utils/network-status.util'
import { db } from '@/shared/libs/firebase'
import {
  isFirestoreRejection,
  logFirestoreError,
} from '@/shared/utils/firestore-error.util'

type SyncResult = {
  applied: number
  rejected: number
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

/**
 * Registro marcado como pendente sem nada na fila foi deixado para trás por
 * uma versão antiga, que descartava o envio depois de algumas falhas. Ele só
 * existe neste aparelho; devolvê-lo à fila é o que o leva ao servidor.
 */
async function requeueOrphans(): Promise<void> {
  const naFila = new Set(
    (await listOutboxUseCase()).map(
      (mutation) => `${mutation.collection}:${mutation.documentId}`,
    ),
  )

  const orfaos = (await listPendingMirrorUseCase()).filter(
    (record) => !naFila.has(`${record.collection}:${record.id}`),
  )

  for (const record of orfaos) {
    await enqueueMutationUseCase({
      collection: record.collection,
      documentId: record.id,
      operation: 'update',
      payload: record.data as unknown as Record<string, unknown>,
    })
  }
}

async function settleMirror(mutation: OutboxMutation): Promise<void> {
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

      return { applied: 0, rejected: 0, pending: mutations.length }
    }

    await requeueOrphans()

    const mutations = await listOutboxUseCase()
    let applied = 0
    let rejected = 0

    for (const mutation of mutations) {
      try {
        await applyMutation(uid, mutation)
        await removeMutationUseCase(mutation.id)
        await settleMirror(mutation)
        applied += 1
      } catch (caught) {
        /* Recusada não volta a ser tentada nem segura a fila. Sem a marca de
           pendente, a próxima leitura alinha o aparelho com o servidor. */
        if (isFirestoreRejection(caught)) {
          logFirestoreError('sync-outbox', caught)
          await removeMutationUseCase(mutation.id)
          await settleMirror(mutation)
          rejected += 1
          continue
        }

        /* Falha de rede nunca descarta: a alteração espera a próxima
           passada, e as de trás também — a ordem da fila importa. */
        await updateMutationUseCase({
          ...mutation,
          attempts: mutation.attempts + 1,
        })
        break
      }
    }

    const restantes = await listOutboxUseCase()

    return { applied, rejected, pending: restantes.length }
  })().finally(() => {
    emAndamento = null
  })

  return emAndamento
}
