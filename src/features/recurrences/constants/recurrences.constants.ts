import type { RecurrenceStatus } from '../types/recurrence.type'

export const RECURRENCE_STATUS_LABEL: Record<RecurrenceStatus, string> = {
  active: 'Ativa',
  paused: 'Pausada',
}

export const RECURRENCE_INTERVALS = [1, 2, 3, 6, 12]

export const RECURRENCE_INTERVAL_LABEL: Record<number, string> = {
  1: 'Todo mês',
  2: 'A cada 2 meses',
  3: 'A cada 3 meses',
  6: 'A cada 6 meses',
  12: 'Uma vez por ano',
}

export const RECURRENCE_MAX_DAY = 31

export const RECURRENCE_START_MONTH_OPTIONS = 13

export const RECURRENCE_END_MONTH_OPTIONS = 25

export const RECURRENCE_DUE_SOON_DAYS = 7

/** Teto de segurança para a lista de contas atrasadas: uma regra com mês
 *  inicial muito antigo não pode virar uma varredura sem fim. Quem some por
 *  meses continua vendo todas as suas — o corte só existe para o absurdo. */
export const RECURRENCE_MAX_OPEN_MONTHS = 36

export const RECURRENCES_TITLE = 'Recorrências'

export const RECURRENCE_TAB_BILLS = 'Contas do mês'
export const RECURRENCE_TAB_RULES = 'Regras'

export const RECURRENCE_PAUSE_HINT =
  'Pausada, a recorrência para de aparecer nos meses — inclusive nos que ainda não foram pagos.'

export const MESSAGE_NO_RECURRENCES =
  'Nenhuma recorrência cadastrada. Crie uma para a conta que chega todo mês no mesmo dia.'

export const MESSAGE_NO_BILLS_IN_MONTH =
  'Nenhuma conta recorrente cai neste mês.'

export const MESSAGE_NO_OPEN_BILLS = 'Nenhuma conta recorrente em aberto.'

export const OPEN_BILLS_TITLE = 'Contas em aberto'
