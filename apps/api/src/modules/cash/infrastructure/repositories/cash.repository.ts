import { db } from '@/shared/db'
import { getTenantId } from '@/shared/tenancy/request-context'
import { cashRegisters, cashSessions, cashTransactions } from '@/shared/db/schema/cash'
import { eq, and, desc } from 'drizzle-orm'
import type { CashTransactionInput } from '../../presentation/schemas/cash.schema'

export const cashRepository = {
  async listRegisters(branchId?: string) {
    const conditions = [eq(cashRegisters.tenantId, getTenantId())]
    if (branchId) conditions.push(eq(cashRegisters.branchId, branchId))
    return db.query.cashRegisters.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [cashRegisters.name],
    })
  },

  async findRegisterById(id: string) {
    return db.query.cashRegisters.findFirst({
      where: and(eq(cashRegisters.id, id), eq(cashRegisters.tenantId, getTenantId())),
    })
  },

  async listSessions(registerId?: string, onlyOpen: boolean = false) {
    const conditions = [eq(cashSessions.tenantId, getTenantId())]
    if (registerId) conditions.push(eq(cashSessions.cashRegisterId, registerId))
    if (onlyOpen) conditions.push(eq(cashSessions.isOpen, true))
    return db.query.cashSessions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(cashSessions.openedAt)],
    })
  },

  async findSessionById(id: string) {
    return db.query.cashSessions.findFirst({
      where: and(eq(cashSessions.id, id), eq(cashSessions.tenantId, getTenantId())),
    })
  },

  async findOpenSession(registerId: string) {
    return db.query.cashSessions.findFirst({
      where: and(
        eq(cashSessions.cashRegisterId, registerId),
        eq(cashSessions.tenantId, getTenantId()),
        eq(cashSessions.isOpen, true)
      ),
    })
  },

  async createSession(data: {
    cashRegisterId: string
    userId: string
    initialBalance: string
    currency?: string
  }) {
    const [session] = await db
      .insert(cashSessions)
      .values({ ...data, tenantId: getTenantId() })
      .returning()
    return session
  },

  async closeSession(id: string, data: {
    countedBalance: string
    expectedBalance: string
    difference: string
  }) {
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
  },

  async addTransaction(sessionId: string, data: CashTransactionInput & { actorId: string }) {
    const [transaction] = await db
      .insert(cashTransactions)
      .values({
        tenantId: getTenantId(),
        sessionId,
        ...data,
      })
      .returning()
    return transaction
  },

  async getSessionTransactions(sessionId: string) {
    return db.query.cashTransactions.findMany({
      where: and(eq(cashTransactions.sessionId, sessionId), eq(cashTransactions.tenantId, getTenantId())),
      orderBy: [desc(cashTransactions.createdAt)],
    })
  },
}
