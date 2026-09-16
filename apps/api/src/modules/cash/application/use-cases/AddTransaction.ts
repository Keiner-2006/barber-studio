import { ICashRepository, CreateCashTransactionData } from '../ports/ICashRepository'
import { CashTransaction } from '../../domain/entities/CashTransaction'

export interface AddTransactionRequest {
  sessionId: string
  type: 'sale' | 'appointment' | 'expense' | 'refund' | 'adjustment'
  method: 'cash' | 'card_manual' | 'transfer_manual' | 'other'
  amount: string
  reference?: string
  notes?: string
  actorId: string
}

export class AddTransactionUseCase {
  constructor(private readonly repository: ICashRepository) {}

  async execute(request: AddTransactionRequest): Promise<CashTransaction> {
    if (!request.amount || parseFloat(request.amount) <= 0) {
      throw new Error('Transaction amount must be positive')
    }

    const data: CreateCashTransactionData = {
      sessionId: request.sessionId,
      type: request.type,
      method: request.method,
      amount: request.amount,
      reference: request.reference ?? null,
      notes: request.notes ?? null,
      actorId: request.actorId,
    }

    return this.repository.addTransaction(request.sessionId, data)
  }
}