'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

import { cardRoute } from '@/features/platform/constants/app-routes.constants'
import { Card } from '@/shared/components/card'
import { ProgressBar } from '@/shared/components/progress-bar'
import { cn } from '@/shared/utils/cn.util'
import { formatMoney } from '@/shared/utils/money.util'

import { CARD_BRAND_LABEL, CARD_KIND_LABEL } from '../constants/cards.constants'
import type { CardUsage } from '../types/card.type'

type CardItemProps = {
  usage: CardUsage
  onEdit: () => void
}

export function CardItem({ usage, onEdit }: CardItemProps) {
  const { card } = usage
  const alimentacao = card.kind === 'meal'

  const identidade = (
    <>
      <span
        aria-hidden
        style={{ backgroundColor: card.color }}
        className="h-9 w-12 shrink-0 rounded-lg"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-ink text-sm font-semibold">{card.name}</span>
        <span className="text-ink-faint text-[11px]">
          {alimentacao
            ? CARD_KIND_LABEL.meal
            : `${CARD_BRAND_LABEL[card.brand]} · fecha dia ${card.closingDay} · vence dia ${card.dueDay}`}
        </span>
      </span>
    </>
  )

  /* Alimentação não tem fatura para abrir — o cartão é o próprio saldo. */
  const cabecalho: ReactNode = alimentacao ? (
    <div className="flex items-center gap-3">{identidade}</div>
  ) : (
    <Link href={cardRoute(card.id)} className="flex items-center gap-3">
      {identidade}
    </Link>
  )

  const acompanha = alimentacao ? card.balanceCents > 0 : card.limitCents > 0

  return (
    <Card className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        {cabecalho}

        <button
          type="button"
          onClick={onEdit}
          className="text-ink-faint hover:text-ink text-xs font-medium"
        >
          Editar
        </button>
      </div>

      {acompanha && (
        <div className="flex flex-col gap-1.5">
          <ProgressBar
            value={usage.usedPercent}
            barClassName={usage.usedPercent > 85 ? 'bg-danger' : undefined}
          />
          <div className="text-ink-faint flex justify-between text-[11px]">
            <span className="numeric">
              {formatMoney(usage.usedCents)} {alimentacao ? 'gastos' : 'usados'}
            </span>
            <span
              className={cn(
                'numeric',
                usage.availableCents < 0 && 'text-danger',
              )}
            >
              {formatMoney(usage.availableCents)}{' '}
              {alimentacao ? 'de saldo' : 'disponíveis'}
            </span>
          </div>
        </div>
      )}

      {!acompanha && usage.usedCents > 0 && (
        <span className="numeric text-ink-muted text-[11px]">
          {formatMoney(usage.usedCents)}{' '}
          {alimentacao ? 'gastos desde a última recarga' : 'em faturas abertas'}
        </span>
      )}
    </Card>
  )
}
