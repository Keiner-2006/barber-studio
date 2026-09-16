import { CashTransaction } from '../../domain/entities/CashTransaction'

export interface CreateCashTransactionData {
  sessionId: string
  type: 'sale' | 'appointment' | 'expense' | 'refund' | 'adjustment'
  method: 'cash' | 'card_manual' | 'transfer_manual' | 'other'
  amount: string
  currency?: string
  reference?: string | null
  notes?: string | null
  actorId: string
}

export interface ICashRepository {
  listRegisters(branchId?: string): Promise<any[]>
  findRegisterById(id: string): Promise<any | null>
  listSessions(registerId?: string, onlyOpen?: boolean): Promise<any[]>
  findSessionById(id: string): Promise<any | null>
  findOpenSession(registerId: string): Promise<any | null>
  createSession(data: { cashRegisterId: string; userId: string; initialBalance: string; currency?: string }): Promise<any>
  closeSession(id: string, data: { countedBalance: string; expectedBalance: string; difference: string }): Promise<any | null>
  addTransaction(sessionId: string, data: CreateCashTransactionData): Promise<CashTransaction>
  getSessionTransactions(sessionId: string): Promise<CashTransaction[]>
}