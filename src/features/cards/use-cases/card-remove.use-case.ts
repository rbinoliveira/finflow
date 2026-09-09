import type { Installment } from '@/features/invoices/types/installment.type'
import {
  removeDocumentUseCase,
  removeManyDocumentsUseCase,
} from '@/features/offline/use-cases/collection-repository.use-case'

/**
 * A parcela só existe porque existe a fatura de um cartão: sem ele, ela não
 * tem onde vencer. O lançamento fica — a compra aconteceu e continua pesando
 * no mês, mesmo que o cartão em que ela saiu não esteja mais cadastrado.
 */
export async function removeCardUseCase(
  uid: string,
  id: string,
  installments: Installment[],
): Promise<void> {
  const doCartao = installments.filter(
    (installment) => installment.cardId === id,
  )

  if (doCartao.length > 0) {
    await removeManyDocumentsUseCase(
      uid,
      'installments',
      doCartao.map((installment) => installment.id),
    )
  }

  await removeDocumentUseCase(uid, 'cards', id)
}
