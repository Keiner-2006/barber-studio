export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD_MANUAL: 'card_manual',
  TRANSFER_MANUAL: 'transfer_manual',
  OTHER: 'other',
} as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card_manual: 'Tarjeta (manual)',
  transfer_manual: 'Transferencia (manual)',
  other: 'Otro',
}

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  RECORDED: 'recorded',
  REFUNDED: 'refunded',
  VOIDED: 'voided',
} as const

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES]
