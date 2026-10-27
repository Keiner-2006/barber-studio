export interface ICashRegisterRepository {
  findAll(tenantId: string): Promise<CashRegister[]>;
  findById(tenantId: string, id: string): Promise<CashRegister | null>;
  create(tenantId: string, data: CreateCashRegisterData): Promise<CashRegister>;
  update(tenantId: string, id: string, data: UpdateCashRegisterData): Promise<CashRegister | null>;
}

export interface CreateCashRegisterData {
  branchId: string;
  name: string;
  initialBalance?: number;
}

export interface UpdateCashRegisterData {
  name?: string;
  status?: string;
  initialBalance?: number;
}

export class CashRegister {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly branchId: string,
    public readonly name: string,
    public readonly status: string,
    public readonly initialBalance: number,
    public readonly openedBy: string | null,
    public readonly closedBy: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  toPlain() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      branchId: this.branchId,
      name: this.name,
      status: this.status,
      initialBalance: this.initialBalance,
      openedBy: this.openedBy,
      closedBy: this.closedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export interface ICashTransactionRepository {
  findBySession(tenantId: string, sessionId: string): Promise<CashTransaction[]>;
  create(tenantId: string, data: CreateCashTransactionData): Promise<CashTransaction>;
}

export interface CreateCashTransactionData {
  sessionId: string;
  type: 'sale' | 'appointment' | 'expense' | 'refund' | 'adjustment';
  method: 'cash' | 'card_manual' | 'transfer_manual' | 'other';
  amount: number;
  currency?: string;
  reference?: string;
  notes?: string;
  actorId: string;
}

export class CashTransaction {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly sessionId: string,
    public readonly type: 'sale' | 'appointment' | 'expense' | 'refund' | 'adjustment',
    public readonly method: 'cash' | 'card_manual' | 'transfer_manual' | 'other',
    public readonly amount: number,
    public readonly currency: string,
    public readonly reference: string | null,
    public readonly notes: string | null,
    public readonly actorId: string,
    public readonly reconciled: boolean,
    public readonly createdAt: Date,
  ) {}

  toPlain() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      sessionId: this.sessionId,
      type: this.type,
      method: this.method,
      amount: this.amount,
      currency: this.currency,
      reference: this.reference,
      notes: this.notes,
      actorId: this.actorId,
      reconciled: this.reconciled,
      createdAt: this.createdAt,
    };
  }
}
