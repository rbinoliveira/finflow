'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import {
  MESSAGE_CATEGORY_OPTIONAL,
  UNCATEGORIZED_LABEL,
} from '@/features/categories/constants/categories.constants'
import { useLedger } from '@/features/ledger/providers/ledger.provider'
import { Button } from '@/shared/components/button'
import { ChipSelect } from '@/shared/components/chip-select'
import { MoneyField } from '@/shared/components/money-field'
import { SegmentedControl } from '@/shared/components/segmented-control'
import { SelectField } from '@/shared/components/select-field'
import { TextField } from '@/shared/components/text-field'
import { todayIso } from '@/shared/utils/date.util'
import { formatMoney, splitCents } from '@/shared/utils/money.util'

import {
  EXPENSE_METHODS,
  INCOME_METHODS,
  MAX_INSTALLMENTS,
  PAYMENT_METHOD_LABEL,
} from '../constants/transactions.constants'
import {
  type TransactionSchema,
  transactionSchema,
} from '../schemas/transaction.schema'
import type { Transaction, TransactionKind } from '../types/transaction.type'
import {
  createTransactionUseCase,
  updateTransactionUseCase,
} from '../use-cases/transaction-save.use-case'
import { TransactionDateField } from './transaction-date-field'
import { TransactionPaymentField } from './transaction-payment-field'

const UNCATEGORIZED_VALUE = ''

type TransactionFormProps = {
  kind: TransactionKind
  transaction: Transaction | null
  onDone: () => void
}

function defaultValues(
  kind: TransactionKind,
  transaction: Transaction | null,
): TransactionSchema {
  if (transaction) {
    return {
      kind: transaction.kind,
      description: transaction.description,
      amountCents: transaction.amountCents,
      categoryId: transaction.categoryId,
      method: transaction.method,
      cardId: transaction.cardId,
      date: transaction.date,
      installments: transaction.installments,
      paymentDate: transaction.paymentDate ?? null,
    }
  }

  return {
    kind,
    description: '',
    amountCents: 0,
    categoryId: null,
    method: 'pix',
    cardId: null,
    date: todayIso(),
    installments: 1,
    paymentDate: null,
  }
}

export function TransactionForm({
  kind,
  transaction,
  onDone,
}: TransactionFormProps) {
  const { uid, categories, cards, installments, reload } = useLedger()

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionSchema>({
    resolver: zodResolver(transactionSchema),
    defaultValues: defaultValues(kind, transaction),
  })

  const currentKind = watch('kind')
  const currentMethod = watch('method')
  const currentAmount = watch('amountCents')
  const currentInstallments = watch('installments')
  const currentCardId = watch('cardId')
  const currentDate = watch('date')

  const cartao = cards.find((card) => card.id === currentCardId) ?? null

  const methods = currentKind === 'income' ? INCOME_METHODS : EXPENSE_METHODS

  const categoryOptions = categories
    .filter((category) => category.kind === currentKind)
    .map((category) => ({
      value: category.id,
      label: category.name,
      emoji: category.emoji,
      color: category.color,
    }))

  const onSubmit = handleSubmit(async (values) => {
    if (!uid) return

    const input = {
      ...values,
      description: values.description.trim(),
      cardId: values.method === 'card' ? values.cardId : null,
      installments: values.method === 'card' ? values.installments : 1,
      paymentDate: values.method === 'card' ? values.paymentDate : null,
      recurrenceId: transaction?.recurrenceId ?? null,
    }

    const context = { cards, installments }

    if (transaction) {
      await updateTransactionUseCase(uid, transaction, input, context)
    } else {
      await createTransactionUseCase(uid, input, context)
    }

    await reload()
    onDone()
  })

  const parcela =
    currentMethod === 'card' && currentInstallments > 1
      ? splitCents(currentAmount, currentInstallments)[0]
      : null

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 pb-5">
      {/* Criando, o tipo já foi escolhido no `+` e o título o repete — repetir
          o controle aqui só ocuparia a tela. Editando não houve esse passo, e
          sem ele não haveria como corrigir um lançamento do tipo errado. */}
      {transaction && (
        <Controller
          control={control}
          name="kind"
          render={({ field }) => (
            <SegmentedControl
              label="Tipo do lançamento"
              value={field.value}
              onChange={(value) => {
                field.onChange(value)
                setValue('categoryId', null)
                setValue('method', 'pix')
                setValue('cardId', null)
                setValue('installments', 1)
              }}
              options={[
                { value: 'expense', label: 'Despesa' },
                { value: 'income', label: 'Receita' },
              ]}
            />
          )}
        />
      )}

      <Controller
        control={control}
        name="amountCents"
        render={({ field }) => (
          <MoneyField
            large
            autoFocus
            label="Valor"
            value={field.value}
            onChange={field.onChange}
            error={errors.amountCents?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <TextField
            label="Descrição"
            placeholder="Padaria, aluguel, salário…"
            value={field.value}
            onChange={field.onChange}
            error={errors.description?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="categoryId"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <span className="text-ink-muted text-[11px] font-medium tracking-wide uppercase">
              Categoria
            </span>
            <ChipSelect
              label="Categoria"
              value={field.value ?? UNCATEGORIZED_VALUE}
              options={[
                { value: UNCATEGORIZED_VALUE, label: UNCATEGORIZED_LABEL },
                ...categoryOptions,
              ]}
              onChange={(value) =>
                field.onChange(value === UNCATEGORIZED_VALUE ? null : value)
              }
            />
            {categoryOptions.length === 0 && (
              <span className="text-ink-faint text-[11px]">
                {MESSAGE_CATEGORY_OPTIONAL}
              </span>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name="method"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <span className="text-ink-muted text-[11px] font-medium tracking-wide uppercase">
              Forma de pagamento
            </span>
            <ChipSelect
              label="Forma de pagamento"
              value={field.value}
              options={methods.map((method) => ({
                value: method,
                label: PAYMENT_METHOD_LABEL[method],
              }))}
              onChange={(value) => {
                field.onChange(value)
                if (value !== 'card') {
                  setValue('cardId', null)
                  setValue('installments', 1)
                }
              }}
            />
          </div>
        )}
      />

      <Controller
        control={control}
        name="date"
        render={({ field }) => (
          <TransactionDateField
            value={field.value}
            onChange={field.onChange}
            label={currentMethod === 'card' ? 'Data da compra' : 'Data'}
            error={errors.date?.message}
          />
        )}
      />

      {currentMethod === 'card' && (
        <>
          <Controller
            control={control}
            name="cardId"
            render={({ field }) => (
              <SelectField
                label="Cartão"
                placeholder="Escolha o cartão"
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value || null)}
                error={errors.cardId?.message}
                options={cards.map((card) => ({
                  value: card.id,
                  label: card.name,
                }))}
              />
            )}
          />

          <Controller
            control={control}
            name="installments"
            render={({ field }) => (
              <SelectField
                label="Parcelas"
                value={String(field.value)}
                onChange={(event) => field.onChange(Number(event.target.value))}
                error={errors.installments?.message}
                hint={
                  parcela
                    ? `${currentInstallments}× de ${formatMoney(parcela)}`
                    : undefined
                }
                options={Array.from(
                  { length: MAX_INSTALLMENTS },
                  (unused, index) => ({
                    value: String(index + 1),
                    label: index === 0 ? 'À vista' : `${index + 1}×`,
                  }),
                )}
              />
            )}
          />

          {cartao && (
            <Controller
              control={control}
              name="paymentDate"
              render={({ field }) => (
                <TransactionPaymentField
                  value={field.value}
                  onChange={field.onChange}
                  card={cartao}
                  purchaseDate={currentDate}
                  installments={currentInstallments}
                  error={errors.paymentDate?.message}
                />
              )}
            />
          )}
        </>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="flex-1" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {transaction ? 'Salvar' : 'Lançar'}
        </Button>
      </div>
    </form>
  )
}
