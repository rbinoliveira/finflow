import type { Installment } from '@/features/invoices/types/installment.type'
import {
  removeDocumentUseCase,
  removeManyDocumentsUseCase,
} from '@/features/offline/use-cases/collection-repository.use-case'

export async function removeTransactionUseCase(
  uid: string,
  transactionId: string,
  installments: Installment[],
): Promise<void> {
  const vinculadas = installments.filter(
    (installment) => installment.transactionId === transactionId,
  )

  if (vinculadas.length > 0) {
    await removeManyDocumentsUseCase(
      uid,
      'installments',
      vinculadas.map((installment) => installment.id),
    )
  }

  await removeDocumentUseCase(uid, 'transactions', transactionId)
}
