'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import {
  MESSAGE_CATEGORY_OPTIONAL,
  UNCATEGORIZED_LABEL,
} from '@/features/categories/constants/categories.constants'
import { useLedger } from '@/features/ledger/providers/ledger.provider'
import {
  EXPENSE_METHODS,
  INCOME_METHODS,
  PAYMENT_METHOD_LABEL,
} from '@/features/transactions/constants/transactions.constants'
import type { TransactionKind } from '@/features/transactions/types/transaction.type'
import { Button } from '@/shared/components/button'
import { ChipSelect } from '@/shared/components/chip-select'
import { DayPicker } from '@/shared/components/day-picker'
import { MoneyField } from '@/shared/components/money-field'
import { SegmentedControl } from '@/shared/components/segmented-control'
import { SelectField } from '@/shared/components/select-field'
import { TextField } from '@/shared/components/text-field'
import { currentMonth } from '@/shared/utils/date.util'

import {
  RECURRENCE_INTERVAL_LABEL,
  RECURRENCE_INTERVALS,
  RECURRENCE_PAUSE_HINT,
  RECURRENCE_STATUS_LABEL,
} from '../constants/recurrences.constants'
import {
  type RecurrenceSchema,
  recurrenceSchema,
} from '../schemas/recurrence.schema'
import type { Recurrence } from '../types/recurrence.type'
import {
  createRecurrenceUseCase,
  updateRecurrenceUseCase,
} from '../use-cases/recurrence-save.use-case'
import {
  endMonthOptions,
  startMonthOptions,
} from '../utils/recurrence-month-options.util'

const UNCATEGORIZED_VALUE = ''
const NO_END_VALUE = ''
const DEFAULT_DAY = 10

type RecurrenceFormProps = {
  kind: TransactionKind
  recurrence: Recurrence | null
  onDone: () => void
  onRemove: (recurrence: Recurrence) => void
}

function defaultValues(
  kind: TransactionKind,
  recurrence: Recurrence | null,
): RecurrenceSchema {
  if (recurrence) {
    return {
      kind: recurrence.kind,
      description: recurrence.description,
      amountCents: recurrence.amountCents,
      categoryId: recurrence.categoryId,
      method: recurrence.method,
      cardId: recurrence.cardId,
      dayOfMonth: recurrence.dayOfMonth,
      everyMonths: recurrence.everyMonths,
      startMonth: recurrence.startMonth,
      endMonth: recurrence.endMonth,
      status: recurrence.status,
    }
  }

  return {
    kind,
    description: '',
    amountCents: 0,
    categoryId: null,
    method: 'pix',
    cardId: null,
    dayOfMonth: DEFAULT_DAY,
    everyMonths: 1,
    startMonth: currentMonth(),
    endMonth: null,
    status: 'active',
  }
}

export function RecurrenceForm({
  kind,
  recurrence,
  onDone,
  onRemove,
}: RecurrenceFormProps) {
  const { uid, categories, cards, reload } = useLedger()

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecurrenceSchema>({
    resolver: zodResolver(recurrenceSchema),
    defaultValues: defaultValues(kind, recurrence),
  })

  const currentKind = watch('kind')
  const currentMethod = watch('method')
  const currentStart = watch('startMonth')

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
    }

    if (recurrence) {
      await updateRecurrenceUseCase(uid, recurrence, input)
    } else {
      await createRecurrenceUseCase(uid, input)
    }

    await reload()
    onDone()
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 pb-5">
      <Controller
        control={control}
        name="kind"
        render={({ field }) => (
          <SegmentedControl
            label="Tipo da recorrência"
            value={field.value}
            onChange={(value) => {
              field.onChange(value)
              setValue('categoryId', null)
              setValue('method', 'pix')
              setValue('cardId', null)
            }}
            options={[
              { value: 'expense', label: 'Despesa' },
              { value: 'income', label: 'Receita' },
            ]}
          />
        )}
      />

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
            placeholder="Internet, aluguel, streaming…"
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
                if (value !== 'card') setValue('cardId', null)
              }}
            />
          </div>
        )}
      />

      {currentMethod === 'card' && (
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
      )}

      <Controller
        control={control}
        name="dayOfMonth"
        render={({ field }) => (
          <DayPicker
            label="Dia da cobrança"
            value={field.value}
            onChange={field.onChange}
            error={errors.dayOfMonth?.message}
            hint="Em meses curtos a cobrança cai no último dia."
          />
        )}
      />

      <Controller
        control={control}
        name="everyMonths"
        render={({ field }) => (
          <SelectField
            label="Repetição"
            value={String(field.value)}
            onChange={(event) => field.onChange(Number(event.target.value))}
            error={errors.everyMonths?.message}
            options={RECURRENCE_INTERVALS.map((interval) => ({
              value: String(interval),
              label: RECURRENCE_INTERVAL_LABEL[interval],
            }))}
          />
        )}
      />

      <Controller
        control={control}
        name="startMonth"
        render={({ field }) => (
          <SelectField
            label="Começa em"
            value={field.value}
            onChange={(event) => field.onChange(event.target.value)}
            error={errors.startMonth?.message}
            options={startMonthOptions(field.value)}
          />
        )}
      />

      <Controller
        control={control}
        name="endMonth"
        render={({ field }) => (
          <SelectField
            label="Termina em"
            value={field.value ?? NO_END_VALUE}
            placeholder="Sem data para acabar"
            onChange={(event) => field.onChange(event.target.value || null)}
            error={errors.endMonth?.message}
            options={endMonthOptions(currentStart, field.value)}
          />
        )}
      />

      {recurrence && (
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <span className="text-ink-muted text-[11px] font-medium tracking-wide uppercase">
                Situação
              </span>
              <SegmentedControl
                label="Situação"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'active', label: RECURRENCE_STATUS_LABEL.active },
                  { value: 'paused', label: RECURRENCE_STATUS_LABEL.paused },
                ]}
              />
              <span className="text-ink-faint text-[11px]">
                {RECURRENCE_PAUSE_HINT}
              </span>
            </div>
          )}
        />
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="flex-1" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          Salvar
        </Button>
      </div>

      {recurrence && (
        <Button variant="danger" onClick={() => onRemove(recurrence)}>
          Excluir recorrência
        </Button>
      )}
    </form>
  )
}
