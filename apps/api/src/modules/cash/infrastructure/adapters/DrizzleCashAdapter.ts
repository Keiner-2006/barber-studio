import { ICashRepository, CreateCashTransactionData } from '../../application/ports/ICashRepository'
import { CashTransaction } from '../../domain/entities/CashTransaction'
import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { cashRegisters, cashSessions, cashTransactions } from '@/shared/db/schema/cash'
import { eq, and, desc } from 'drizzle-orm'

export class DrizzleCashAdapter implements ICashRepository {
  async listRegisters(branchId?: string): Promise<any[]> {
    const conditions = [eq(cashRegisters.tenantId, getTenantId())]
    if (branchId) conditions.push(eq(cashRegisters.branchId, branchId))
    return db.query.cashRegisters.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [cashRegisters.name],
    })
  }

  async findRegisterById(id: string): Promise<any | null> {
    return db.query.cashRegisters.findFirst({
      where: and(eq(cashRegisters.id, id), eq(cashRegisters.tenantId, getTenantId())),
    })
  }

  async listSessions(registerId?: string, onlyOpen: boolean = false): Promise<any[]> {
    const conditions = [eq(cashSessions.tenantId, getTenantId())]
    if (registerId) conditions.push(eq(cashSessions.cashRegisterId, registerId))
    if (onlyOpen) conditions.push(eq(cashSessions.isOpen, true))
    return db.query.cashSessions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(cashSessions.openedAt)],
    })
  }

  async findSessionById(id: string): Promise<any | null> {
    return db.query.cashSessions.findFirst({
      where: and(eq(cashSessions.id, id), eq(cashSessions.tenantId, getTenantId())),
    })
  }

  async findOpenSession(registerId: string): Promise<any | null> {
    return db.query.cashSessions.findFirst({
      where: and(
        eq(cashSessions.cashRegisterId, registerId),
        eq(cashSessions.tenantId, getTenantId()),
        eq(cashSessions.isOpen, true)
      ),
    })
  }

  async createSession(data: { cashRegisterId: string; userId: string; initialBalance: string; currency?: string }): Promise<any> {
    const [session] = await db
      .insert(cashSessions)
      .values({ ...data, tenantId: getTenantId() })
      .returning()
    return session
  }

  async closeSession(id: string, data: { countedBalance: string; expectedBalance: string; difference: string }): Promise<any | null> {
    const [session] = await db
      .update(cashSessions)
      .set({
        ...data,
        closedAt: new Date(),
        isOpen: false,
      })
      .where(and(eq(cashSessions.id, id), eq(cashSessions.tenantId, getTenantId())))
      .returning()
    return session
  }

  async addTransaction(sessionId: string, data: CreateCashTransactionData): Promise<CashTransaction> {
    const [row] = await db
      .insert(cashTransactions)
      .values({
        tenantId: getTenantId(),
        sessionId,
        type: data.type,
        method: data.method,
        amount: data.amount,
        currency: data.currency ?? 'MXN',
        reference: data.reference ?? null,
        notes: data.notes ?? null,
        actorId: data.actorId,
      })
      .returning()

    return this.toDomain(row)
  }

  async getSessionTransactions(sessionId: string): Promise<CashTransaction[]> {
    const rows = await db.query.cashTransactions.findMany({
      where: and(eq(cashTransactions.sessionId, sessionId), eq(cashTransactions.tenantId, getTenantId())),
      orderBy: [desc(cashTransactions.createdAt)],
    })

    return rows.map((row) => this.toDomain(row))
  }

  private toDomain(row: any): CashTransaction {
    return CashTransaction.fromPlain({
      id: row.id,
      tenantId: row.tenantId,
      sessionId: row.sessionId,
      type: row.type,
      method: row.method,
      amount: row.amount,
      currency: row.currency,
      reference: row.reference ?? null,
      notes: row.notes ?? null,
      actorId: row.actorId,
      reconciled: row.reconciled,
      createdAt: row.createdAt,
    })
  }
}