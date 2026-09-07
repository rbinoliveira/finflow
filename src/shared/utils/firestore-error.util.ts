const MESSAGE_BY_CODE: Record<string, string> = {
  'permission-denied': 'Sua conta não tem acesso a estes dados.',
  unauthenticated: 'Entre novamente para continuar.',
  unavailable: 'Sem conexão com o servidor. Seus dados locais seguem aqui.',
  'failed-precondition': 'Consulta indisponível no momento.',
  'deadline-exceeded': 'A conexão demorou demais para responder.',
}

function firestoreCode(caught: unknown): string | null {
  if (typeof caught !== 'object' || caught === null) return null

  const code = (caught as { code?: unknown }).code

  return typeof code === 'string' ? code.replace('firestore/', '') : null
}

export function describeFirestoreError(caught: unknown): string {
  const code = firestoreCode(caught)

  if (code && MESSAGE_BY_CODE[code]) return MESSAGE_BY_CODE[code]

  return 'Não foi possível carregar agora. Tente de novo.'
}

export function logFirestoreError(origin: string, caught: unknown): void {
  console.error(`[${origin}]`, caught)
}
