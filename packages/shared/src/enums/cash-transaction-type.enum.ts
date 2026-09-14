export const CASH_TRANSACTION_TYPES = {
  SALE: 'sale',
  APPOINTMENT: 'appointment',
  EXPENSE: 'expense',
  REFUND: 'refund',
  ADJUSTMENT: 'adjustment',
} as const

export type CashTransactionType = (typeof CASH_TRANSACTION_TYPES)[keyof typeof CASH_TRANSACTION_TYPES]

export const CASH_TRANSACTION_TYPE_LABELS: Record<CashTransactionType, string> = {
  sale: 'Venta',
  appointment: 'Reserva',
  expense: 'Gasto',
  refund: 'Reembolso',
  adjustment: 'Ajuste',
}
