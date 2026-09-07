import type { CreditCard } from '@/features/cards/types/card.type'
import type { Installment } from '@/features/invoices/types/installment.type'
import { buildInstallmentsUseCase } from '@/features/invoices/use-cases/installments-build.use-case'
import {
  removeManyDocumentsUseCase,
  saveDocumentUseCase,
  saveManyDocumentsUseCase,
} from '@/features/offline/use-cases/collection-repository.use-case'
import { createLocalId } from '@/features/offline/utils/local-id.util'

import type { Transaction, TransactionInput } from '../types/transaction.type'

type SaveContext = {
  cards: CreditCard[]
  installments: Installment[]
}

function cardOf(input: TransactionInput, cards: CreditCard[]) {
  if (input.method !== 'card' || !input.cardId) return null

  return cards.find((card) => card.id === input.cardId) ?? null
}

async function syncInstallments(
  uid: string,
  transaction: Transaction,
  context: SaveContext,
): Promise<void> {
  const anteriores = context.installments.filter(
    (installment) => installment.transactionId === transaction.id,
  )

  if (anteriores.length > 0) {
    await removeManyDocumentsUseCase(
      uid,
      'installments',
      anteriores.map((installment) => installment.id),
    )
  }

  const card = cardOf(transaction, context.cards)

  if (!card || transaction.kind !== 'expense') return

  await saveManyDocumentsUseCase(
    uid,
    'installments',
    buildInstallmentsUseCase(transaction, card),
  )
}

export async function createTransactionUseCase(
  uid: string,
  input: TransactionInput,
  context: SaveContext,
): Promise<Transaction> {
  const now = Date.now()

  const transaction = await saveDocumentUseCase<Transaction>(
    uid,
    'transactions',
    { ...input, id: createLocalId(), createdAt: now, updatedAt: now },
    'create',
  )

  await syncInstallments(uid, transaction, context)

  return transaction
}

export async function updateTransactionUseCase(
  uid: string,
  transaction: Transaction,
  input: TransactionInput,
  context: SaveContext,
): Promise<Transaction> {
  const atualizada = await saveDocumentUseCase<Transaction>(
    uid,
    'transactions',
    { ...transaction, ...input, updatedAt: Date.now() },
    'update',
  )

  await syncInstallments(uid, atualizada, context)

  return atualizada
}
