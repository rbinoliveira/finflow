'use client'

import { useLedger } from '@/features/ledger/providers/ledger.provider'
import { Button } from '@/shared/components/button'
import { Dialog } from '@/shared/components/dialog'

import type { CreditCard } from '../types/card.type'
import { removeCardUseCase } from '../use-cases/card-remove.use-case'

type CardRemoveDialogProps = {
  card: CreditCard | null
  onClose: () => void
}

function describe(
  lancamentos: number,
  parcelas: number,
  recorrencias: number,
): string {
  const partes = [
    lancamentos > 0
      ? `${lancamentos} lançamento${lancamentos > 1 ? 's' : ''} fica${lancamentos > 1 ? 'm' : ''} no histórico, sem cartão`
      : null,
    parcelas > 0
      ? `${parcelas} parcela${parcelas > 1 ? 's' : ''} e as faturas dele são removidas`
      : null,
    recorrencias > 0
      ? `${recorrencias} recorrência${recorrencias > 1 ? 's' : ''} fica${recorrencias > 1 ? 'm' : ''} sem cartão e precisa${recorrencias > 1 ? 'm' : ''} ser reapontada${recorrencias > 1 ? 's' : ''}`
      : null,
  ].filter(Boolean)

  if (partes.length === 0) return 'Nada usa este cartão ainda.'

  return `${partes.join('; ')}.`
}

export function CardRemoveDialog({ card, onClose }: CardRemoveDialogProps) {
  const { uid, transactions, installments, recurrences, reload } = useLedger()

  const doCartao = card
    ? {
        lancamentos: transactions.filter(
          (transaction) => transaction.cardId === card.id,
        ).length,
        parcelas: installments.filter(
          (installment) => installment.cardId === card.id,
        ).length,
        recorrencias: recurrences.filter(
          (recurrence) => recurrence.cardId === card.id,
        ).length,
      }
    : { lancamentos: 0, parcelas: 0, recorrencias: 0 }

  const remove = async () => {
    if (!uid || !card) return

    await removeCardUseCase(uid, card.id, installments)
    await reload()
    onClose()
  }

  return (
    <Dialog
      open={card !== null}
      title="Remover cartão"
      description={describe(
        doCartao.lancamentos,
        doCartao.parcelas,
        doCartao.recorrencias,
      )}
      onClose={onClose}
    >
      <div className="mt-5 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" className="flex-1" onClick={remove}>
          Remover
        </Button>
      </div>
    </Dialog>
  )
}
