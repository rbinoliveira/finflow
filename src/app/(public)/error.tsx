'use client'

import { Button } from '@/shared/components/button'

type PublicErrorProps = {
  reset: () => void
}

export default function PublicError({ reset }: PublicErrorProps) {
  return (
    <div className="flex flex-col items-start gap-4 py-10">
      <h1 className="text-ink text-lg">Algo saiu do lugar</h1>
      <p className="text-ink-muted text-sm leading-[1.6]">
        Não conseguimos desenhar esta tela agora. Seus lançamentos continuam
        salvos.
      </p>
      <Button onClick={reset}>Tentar de novo</Button>
    </div>
  )
}
