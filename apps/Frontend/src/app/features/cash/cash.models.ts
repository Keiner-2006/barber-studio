export type MovementType = 'sale' | 'appointment' | 'expense' | 'refund' | 'adjustment'
export type PaymentMethod = 'cash' | 'card_manual' | 'transfer_manual' | 'other'

export interface CashRegister {
  id: string
  branchId: string
  branchName: string
  name: string
  status: 'active' | 'inactive'
  initialBalance: string
  openSessionId: string | null
}

/** Live totals of a session. Only cash movements change `expectedCash`. */
export interface SessionTotals {
  cashIn: string
  cashOut: string
  expectedCash: string
  income: string
  incomeCash: string
  incomeCard: string
  incomeTransfer: string
  incomeOther: string
  expenses: string
  refunds: string
  adjustments: string
  movements: number
}

export interface CashSession {
  id: string
  cashRegisterId: string
  cashRegisterName: string
  branchId: string
  userName: string | null
  openedAt: string
  closedAt: string | null
  closedByName: string | null
  initialBalance: string
  expectedBalance: string | null
  countedBalance: string | null
  difference: string | null
  currency: string
  isOpen: boolean
  notes: string | null
  totals: SessionTotals
}

export interface CashTransaction {
  id: string
  sessionId: string
  type: MovementType
  method: PaymentMethod
  amount: string
  currency: string
  reference: string | null
  notes: string | null
  actorName: string | null
  appointmentPaymentId: string | null
  createdAt: string
}

export interface NewMovement {
  type: Exclude<MovementType, 'appointment'>
  method: PaymentMethod
  amount: string
  notes?: string
  reference?: string
}

export const MOVEMENT_LABELS: Record<MovementType, string> = {
  sale: 'Venta',
  appointment: 'Cobro de cita',
  expense: 'Gasto',
  refund: 'Devolución',
  adjustment: 'Ingreso / aporte',
}

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card_manual: 'Tarjeta',
  transfer_manual: 'Transferencia',
  other: 'Otro',
}

/** Movements that take money out of the business. */
export const OUTFLOW_TYPES: MovementType[] = ['expense', 'refund']
