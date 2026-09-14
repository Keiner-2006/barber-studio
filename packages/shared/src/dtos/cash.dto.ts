import type { CashTransactionType } from '../enums/cash-transaction-type.enum'
import type { PaymentMethod } from '../enums/payment-method.enum'

export type OpenCashSessionDTO = {
  cashRegisterId: string
  initialBalance: string
}

export type CloseCashSessionDTO = {
  countedBalance: string
}

export type CashTransactionDTO = {
  type: CashTransactionType
  method: PaymentMethod
  amount: string
  reference?: string
  notes?: string
}

export type CashSessionResponseDTO = {
  id: string
  cashRegisterId: string
  cashRegisterName: string
  userId: string
  userName: string
  openedAt: string
  closedAt?: string
  initialBalance: string
  expectedBalance?: string
  countedBalance?: string
  difference?: string
  currency: string
  isOpen: boolean
}

export type CashTransactionResponseDTO = {
  id: string
  sessionId: string
  type: CashTransactionType
  method: PaymentMethod
  amount: string
  currency: string
  reference?: string
  notes?: string
  actorName: string
  createdAt: string
}

export type CashRegisterDTO = {
  id: string
  branchId: string
  name: string
  status: 'active' | 'inactive'
  initialBalance: string
}

export type CashSummaryDTO = {
  totalSales: string
  totalExpenses: string
  totalRefunds: string
  netBalance: string
  currency: string
  transactionCount: number
}
