export const APP_ROUTES = {
  home: '/',
  transactions: '/transactions',
  cards: '/cards',
  settings: '/settings',
} as const

export function cardRoute(cardId: string): string {
  return `${APP_ROUTES.cards}/${cardId}`
}

export function cardInvoiceRoute(cardId: string, invoiceMonth?: string): string {
  const base = cardRoute(cardId)

  return invoiceMonth ? `${base}?month=${invoiceMonth}` : base
}

export function transactionsRoute(month?: string): string {
  return month
    ? `${APP_ROUTES.transactions}?month=${month}`
    : APP_ROUTES.transactions
}
