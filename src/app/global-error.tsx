'use client'

type GlobalErrorProps = {
  reset: () => void
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          background: '#08090B',
          color: '#E8EDF2',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
        }}
      >
        <h1>FinFlow indisponível</h1>
        <p>Recarregue o app para continuar.</p>
        <button type="button" onClick={reset}>
          Tentar de novo
        </button>
      </body>
    </html>
  )
}
