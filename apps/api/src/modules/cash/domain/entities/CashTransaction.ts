export type CashTransactionType = 'sale' | 'appointment' | 'expense' | 'refund' | 'adjustment'
export type CashPaymentMethod = 'cash' | 'card_manual' | 'transfer_manual' | 'other'

export interface CashTransactionProps {
  id: string
  tenantId: string
  sessionId: string
  type: CashTransactionType
  method: CashPaymentMethod
  amount: string
  currency: string
  reference: string | null
  notes: string | null
  actorId: string
  reconciled: boolean
  createdAt: Date
}

export class CashTransaction {
  constructor(private readonly props: CashTransactionProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get sessionId() { return this.props.sessionId }
  get type() { return this.props.type }
  get method() { return this.props.method }
  get amount() { return this.props.amount }
  get currency() { return this.props.currency }
  get reference() { return this.props.reference }
  get notes() { return this.props.notes }
  get actorId() { return this.props.actorId }
  get reconciled() { return this.props.reconciled }
  get createdAt() { return this.props.createdAt }

  get amountNumber(): number {
    return parseFloat(this.props.amount)
  }

  isIncome(): boolean {
    return ['sale', 'appointment'].includes(this.props.type)
  }

  isExpense(): boolean {
    return ['expense', 'refund', 'adjustment'].includes(this.props.type)
  }

  toPlain(): CashTransactionProps {
    return { ...this.props }
  }

  static fromPlain(props: CashTransactionProps): CashTransaction {
    return new CashTransaction(props)
  }
}