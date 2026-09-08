import { CardInvoicePage } from '@/features/invoices/pages/card-invoice.page'

type CardInvoiceProps = {
  params: Promise<{ cardId: string }>
}

export default async function CardInvoice({ params }: CardInvoiceProps) {
  const { cardId } = await params

  return <CardInvoicePage cardId={cardId} />
}
