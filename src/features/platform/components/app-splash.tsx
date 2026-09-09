import { APP_NAME } from '@/features/platform/constants/app-identity.constants'

/**
 * A mesma imagem em dois momentos: o HTML a serve antes de qualquer script, e
 * as portas de sessão e permissão a repetem enquanto resolvem. Sendo idêntica,
 * a troca entre uma e outra não aparece.
 */
export function AppSplash() {
  return (
    <div className="bg-base flex min-h-dvh flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-3">
        <span aria-hidden className="text-5xl">
          📊
        </span>
        <span className="text-ink font-display text-2xl font-semibold tracking-tight">
          {APP_NAME}
        </span>
      </div>

      <span
        aria-hidden
        className="border-line-strong border-t-accent size-6 animate-spin rounded-full border-2"
      />

      <span className="sr-only" role="status">
        Carregando
      </span>
    </div>
  )
}
