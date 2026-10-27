export interface CashRegister {
  id: string
  branchId: string
  name: string
  status: 'active' | 'inactive'
  initialBalance: string
}

export interface CashSession {
  id: string
  cashRegisterId: string
  cashRegisterName?: string
  userId: string
  userName?: string
  openedAt: string
  closedAt?: string
  initialBalance: string
  expectedBalance?: string
  countedBalance?: string
  difference?: string
  currency: string
  isOpen: boolean
}

export interface CashTransaction {
  id: string
  sessionId: string
  type: 'sale' | 'appointment' | 'expense' | 'refund' | 'adjustment'
  method: 'cash' | 'card_manual' | 'transfer_manual' | 'other'
  amount: string
  currency: string
  reference?: string
  notes?: string
  actorName?: string
  createdAt: string
  concept: string
  methodLabel: string
}

export interface CashSummary {
  totalSales: string
  totalExpenses: string
  totalRefunds: string
  netBalance: string
  currency: string
  transactionCount: number
}
