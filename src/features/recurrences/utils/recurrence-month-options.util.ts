import { currentMonth, monthLabel, shiftMonth } from '@/shared/utils/date.util'

import {
  RECURRENCE_END_MONTH_OPTIONS,
  RECURRENCE_START_MONTH_OPTIONS,
} from '../constants/recurrences.constants'

type MonthOption = {
  value: string
  label: string
}

function sequence(from: string, length: number): MonthOption[] {
  return Array.from({ length }, (unused, index) => {
    const month = shiftMonth(from, index)

    return { value: month, label: monthLabel(month) }
  })
}

/** Um mês anterior ao atual cobre quem cadastra a conta depois de ela já ter
 *  vencido — a ocorrência que passou vira lançamento na hora. */
export function startMonthOptions(selected: string): MonthOption[] {
  const options = sequence(
    shiftMonth(currentMonth(), -1),
    RECURRENCE_START_MONTH_OPTIONS,
  )

  if (options.some((option) => option.value === selected)) return options

  return [{ value: selected, label: monthLabel(selected) }, ...options]
}

export function endMonthOptions(
  startMonth: string,
  selected: string | null,
): MonthOption[] {
  const options = sequence(startMonth, RECURRENCE_END_MONTH_OPTIONS)

  if (!selected || options.some((option) => option.value === selected)) {
    return options
  }

  return [{ value: selected, label: monthLabel(selected) }, ...options]
}
